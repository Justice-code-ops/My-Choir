import { Payment } from "../models/Payment.js";
import { Member } from "../models/Member.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { getDueMonths, calculateBalance, generateReceiptNumber } from "../services/paymentService.js";
import { recordAudit } from "../services/auditService.js";

export const recordPayment = asyncHandler(async (req, res) => {
  const { memberId, amount, month, year, method, reference } = req.body;

  if (!memberId || !month || !year) {
    throw new ApiError(400, "memberId, month, and year are required");
  }

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({
    member: memberId,
    month,
    year,
    status: "paid"
  });

  if (existingPayment) {
    throw new ApiError(400, "Payment already recorded for this month");
  }

  const receiptNumber = generateReceiptNumber();

  const payment = await Payment.create({
    member: memberId,
    amount: amount || member.monthlyDue,
    month,
    year,
    method: method || "manual",
    reference,
    receiptNumber,
    status: "paid",
    paidAt: new Date()
  });

  // Create notification
  await Notification.create({
    recipient: member.user,
    audience: "single",
    title: "Payment Recorded",
    message: `Payment of ₦${payment.amount} for ${new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} has been recorded. Receipt: ${receiptNumber}`,
    type: "payment",
    actionUrl: "/member/payments"
  });

  // Record audit
  await recordAudit(req, "PAYMENT_RECORDED", "Payment", payment._id, {
    memberId,
    amount: payment.amount,
    month,
    year
  });

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: payment
  });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { page, limit, skip } = getPagination(req.query);
  const { status, year } = req.query;

  const filter = { member: memberId };
  if (status) filter.status = status;
  if (year) filter.year = parseInt(year);

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .sort({ year: -1, month: -1 })
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

export const getMemberBalance = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const dueMonths = getDueMonths(member);
  const payments = await Payment.find({ member: memberId, status: "paid" });
  const balance = await calculateBalance(member);

  const monthsData = dueMonths.map((due) => {
    const monthYear = `${due.year}-${String(due.month).padStart(2, "0")}`;
    const paid = payments.some((p) => p.year === due.year && p.month === due.month);

    return {
      month: monthYear,
      status: paid ? "paid" : "unpaid"
    };
  });

  res.json({
    success: true,
    data: {
      memberId,
      memberName: member.fullName,
      monthlyDue: member.monthlyDue,
      totalDue: dueMonths.length * member.monthlyDue,
      totalPaid: payments.filter((p) => p.status === "paid").length * member.monthlyDue,
      balance,
      months: monthsData
    }
  });
});

export const getPaymentReceipt = asyncHandler(async (req, res) => {
  const { receiptNumber } = req.params;

  const payment = await Payment.findOne({ receiptNumber }).populate("member");
  if (!payment) {
    throw new ApiError(404, "Receipt not found");
  }

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

  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate("member");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Record audit
  await recordAudit(req, "PAYMENT_STATUS_UPDATED", "Payment", payment._id, {
    status
  });

  res.json({
    success: true,
    message: "Payment status updated",
    data: payment
  });
});
