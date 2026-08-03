import mongoose from "mongoose";
import { ATTENDANCE_STATUSES } from "../constants/index.js";

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    attendanceCode: {
      type: String,
      trim: true,
      index: true
    },
    mode: {
      type: String,
      enum: ["qr", "code", "manual"],
      default: "manual"
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: "present",
      index: true
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    expectedAt: Date,
    minutesLate: {
      type: Number,
      default: 0
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    notes: String
  },
  { timestamps: true }
);

attendanceSchema.index({ member: 1, event: 1 }, { unique: true, sparse: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);

