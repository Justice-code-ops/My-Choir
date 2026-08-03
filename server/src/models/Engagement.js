import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    type: {
      type: String,
      enum: [
        "prayer-request",
        "testimony",
        "suggestion",
        "volunteer-signup",
        "event-rsvp",
        "practice-log",
        "certificate"
      ],
      required: true,
      index: true
    },
    title: String,
    body: String,
    anonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "approved", "declined", "completed"],
      default: "new",
      index: true
    },
    metadata: mongoose.Schema.Types.Mixed,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

export const Engagement = mongoose.model("Engagement", engagementSchema);

