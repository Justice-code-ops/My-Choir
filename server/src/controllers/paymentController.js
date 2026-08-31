import { Payment } from "../models/Payment.js";
import { Member } from "../models/Member.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { calculateBalance, calculatePaymentSummary, getDueMonths, generateReceiptNumber } from "../services/paymentService.js";
import { recordAudit } from "../services/auditService.js";

const canManagePayments = (user) => ["admin", "super-admin"].includes(user.role);

const assertCanAccessMember = (req, member) => {
  if (!member?.user) {
    throw new ApiError(404, "Member not found");
  }
  if (canManagePayments(req.user)) return;
  if (req.user._id.toString() === member.user.toString()) return;
  throw new ApiError(403, "You do not have permission to access these payments");
};

const assertValidPeriod = (month, year) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError(400, "month must be a number between 1 and 12");
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new ApiError(400, "year must be a valid four-digit year");
  }
};

const recordSuccessfulPayment = async ({ member, amount, month, year, method, reference, recordedBy }) => {
  assertValidPeriod(month, year);

  const paymentAmount = Number(amount ?? member.monthlyDue);
  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw new ApiError(400, "amount must be greater than zero");
  }

  const existingPaidPayment = await Payment.findOne({
    member: member._id,
    month,
    year,
    status: "paid"
  });

  if (existingPaidPayment) {
    throw new ApiError(400, "Payment already recorded for this month");
  }

  const receiptNumber = generateReceiptNumber();
  const existingPendingPayment = await Payment.findOne({
    member: member._id,
    month,
    year,
    status: "pending"
  });

  if (existingPendingPayment) {
    existingPendingPayment.amount = paymentAmount;
    existingPendingPayment.method = method || "manual";
    existingPendingPayment.reference = reference;
    existingPendingPayment.receiptNumber = receiptNumber;
    existingPendingPayment.status = "paid";
    existingPendingPayment.paidAt = new Date();
    existingPendingPayment.recordedBy = recordedBy;
    await existingPendingPayment.save();
    return existingPendingPayment;
  }

  return Payment.create({
    member: member._id,
    amount: paymentAmount,
    month,
    year,
    method: method || "manual",
    reference,
    receiptNumber,
    status: "paid",
    paidAt: new Date(),
    recordedBy
  });
};

const sendPaymentHistory = async (req, res, memberId) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, year } = req.query;

  const filter = { member: memberId };
  if (status) filter.status = status;
  if (year) filter.year = parseInt(year);

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .sort({ year: -1, month: -1, paidAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

export const recordPayment = asyncHandler(async (req, res) => {
  const { memberId, amount, month, year, method, reference } = req.body;

  if (!memberId || !month || !year) {
    throw new ApiError(400, "memberId, month, and year are required");
  }

  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  assertValidPeriod(parsedMonth, parsedYear);

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const payment = await recordSuccessfulPayment({
    member,
    amount,
    month: parsedMonth,
    year: parsedYear,
    method,
    reference,
    recordedBy: req.user._id
  });

  await Notification.create({
    recipient: member.user,
    audience: "single",
    title: "Payment Recorded",
    message: `Payment of NGN ${payment.amount} for ${new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} has been recorded. Receipt: ${payment.receiptNumber}`,
    type: "payment",
    actionUrl: "/member/payments"
  });

  await recordAudit(req, "PAYMENT_RECORDED", "Payment", payment._id, {
    memberId,
    amount: payment.amount,
    month: payment.month,
    year: payment.year
  });

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: payment
  });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const member = await Member.findById(memberId);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  await sendPaymentHistory(req, res, memberId);
});

export const getMemberBalance = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  const dueMonths = getDueMonths(member);
  const payments = await Payment.find({ member: memberId, status: "paid" });
  const balance = await calculateBalance(member);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidKeys = new Set(payments.map((payment) => `${payment.year}-${payment.month}`));
  const outstandingMonths = dueMonths.filter((due) => !paidKeys.has(`${due.year}-${due.month}`));

  const monthsData = dueMonths.map((due) => {
    const monthYear = `${due.year}-${String(due.month).padStart(2, "0")}`;
    const paid = payments.some((p) => p.year === due.year && p.month === due.month);

    return {
      month: monthYear,
      monthNumber: due.month,
      year: due.year,
      amount: due.amount,
      status: paid ? "paid" : "unpaid"
    };
  });

  res.json({
    success: true,
    data: {
      memberId,
      memberName: member.fullName,
      monthlyDue: member.monthlyDue,
      totalDue: dueMonths.reduce((sum, due) => sum + due.amount, 0),
      totalPaid,
      balance,
      outstandingBalance: balance,
      outstandingMonths,
      nextDue: outstandingMonths[0] || null,
      months: monthsData
    }
  });
});

export const getMyPaymentSummary = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });

  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  const summary = await calculatePaymentSummary(member);

  res.json({
    success: true,
    data: {
      memberId: member._id,
      memberName: member.fullName,
      monthlyDue: summary.monthlyDue,
      totalDue: summary.paidTotal + summary.outstandingTotal,
      totalPaid: summary.paidTotal,
      balance: summary.outstandingTotal,
      outstandingBalance: summary.outstandingTotal,
      paidMonths: summary.paidMonths,
      outstandingMonths: summary.outstandingMonths,
      nextDue: summary.outstandingMonths[0] || null
    }
  });
});

export const getMyPaymentHistory = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });

  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  await sendPaymentHistory(req, res, member._id);
});

export const simulateMemberPayment = asyncHandler(async (req, res) => {
  const { month, year, amount } = req.body;
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (!parsedMonth || !parsedYear) {
    throw new ApiError(400, "month and year are required");
  }

  assertValidPeriod(parsedMonth, parsedYear);

  const member = await Member.findOne({ user: req.user._id });

  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  if (member.status !== "approved") {
    throw new ApiError(403, "Only approved members can pay dues");
  }

  const payment = await recordSuccessfulPayment({
    member,
    amount: Number(amount) || member.monthlyDue,
    month: parsedMonth,
    year: parsedYear,
    method: "online",
    reference: `SIM-${Date.now()}-${member._id.toString().slice(-6)}`,
    recordedBy: req.user._id
  });

  await Notification.create({
    recipient: member.user,
    audience: "single",
    title: "Payment Confirmed",
    message: `Your dues payment of NGN ${payment.amount} has been confirmed. Receipt: ${payment.receiptNumber}`,
    type: "payment",
    actionUrl: "/member/payments"
  });

  await recordAudit(req, "PAYMENT_SIMULATED", "Payment", payment._id, {
    memberId: member._id,
    amount: payment.amount,
    month: payment.month,
    year: payment.year
  });

  res.status(201).json({
    success: true,
    message: "Payment confirmed",
    data: payment
  });
});

export const getPaymentReceipt = asyncHandler(async (req, res) => {
  const { receiptNumber } = req.params;

  const payment = await Payment.findOne({ receiptNumber }).populate("member");
  if (!payment) {
    throw new ApiError(404, "Receipt not found");
  }

  assertCanAccessMember(req, payment.member);

  res.json({
    success: true,
    data: {
      receiptNumber: payment.receiptNumber,
      memberName: payment.member.fullName,
      memberId: payment.member.choirId,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
      issuedAt: payment.createdAt
    }
  });
});

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, month, year } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate("member", "fullName choirId voicePart")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["pending", "paid", "failed", "refunded"].includes(status)) {
    throw new ApiError(400, "Invalid payment status");
  }

  const payment = await Payment.findById(req.params.id).populate("member");
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  payment.status = status;
  if (status === "paid") {
    payment.paidAt = payment.paidAt || new Date();
    payment.receiptNumber = payment.receiptNumber || generateReceiptNumber();
    payment.recordedBy = payment.recordedBy || req.user._id;
  }
  await payment.save();

  await recordAudit(req, "PAYMENT_STATUS_UPDATED", "Payment", payment._id, {
    status
  });

  res.json({
    success: true,
    message: "Payment status updated",
    data: payment
  });
});
