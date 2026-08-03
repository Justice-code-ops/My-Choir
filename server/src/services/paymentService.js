import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";
import { generateReceiptNumber } from "../utils/idGenerator.js";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const getDueMonths = (member, throughDate = new Date()) => {
  const joinedDate = member.dateJoinedChoir || member.dateJoinedChurch || member.createdAt || new Date();
  const cursor = startOfMonth(new Date(joinedDate));
  const end = startOfMonth(throughDate);
  const months = [];

  while (cursor <= end) {
    months.push({
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
      amount: member.monthlyDue || env.monthlyDue
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

export const calculatePaymentSummary = async (member) => {
  const dues = getDueMonths(member);
  const payments = await Payment.find({
    member: member._id,
    status: "paid"
  }).sort({ year: -1, month: -1 });

  const paidKeys = new Set(payments.map((payment) => `${payment.year}-${payment.month}`));
  const outstandingMonths = dues.filter((due) => !paidKeys.has(`${due.year}-${due.month}`));
  const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingTotal = outstandingMonths.reduce((sum, due) => sum + due.amount, 0);

  return {
    monthlyDue: member.monthlyDue || env.monthlyDue,
    paidTotal,
    outstandingTotal,
    paidMonths: payments.length,
    outstandingMonths,
    payments
  };
};

export const createPaidRecord = async (payload) =>
  Payment.create({
    ...payload,
    status: payload.status || "paid",
    receiptNumber: payload.receiptNumber || generateReceiptNumber(),
    paidAt: payload.paidAt || new Date()
  });

export const calculateBalance = async (member) => {
  const summary = await calculatePaymentSummary(member);
  return summary.outstandingTotal;
};

