import mongoose from "mongoose";
import { PAYMENT_STATUSES } from "../constants/index.js";
import { env } from "../config/env.js";

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      default: () => env.monthlyDue
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
      index: true
    },
    method: {
      type: String,
      enum: ["cash", "transfer", "card", "online", "manual", "other"],
      default: "manual"
    },
    channel: String,
    reference: {
      type: String,
      trim: true,
      index: true
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    paidAt: Date,
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

paymentSchema.index({ member: 1, year: 1, month: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);

