import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    audience: {
      type: String,
      enum: ["single", "members", "admins", "all"],
      default: "single",
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["approval", "payment", "attendance", "event", "birthday", "announcement", "system"],
      default: "system"
    },
    readAt: Date,
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);

