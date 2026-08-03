import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },
    slug: {
      type: String,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ["rehearsal", "service", "concert", "training", "meeting", "outreach", "anniversary"],
      default: "rehearsal",
      index: true
    },
    description: String,
    location: String,
    startsAt: {
      type: Date,
      required: true,
      index: true
    },
    endsAt: Date,
    attendanceCode: {
      type: String,
      trim: true,
      index: true
    },
    image: {
      url: String,
      publicId: String,
      provider: String
    },
    visibility: {
      type: String,
      enum: ["public", "members", "admins"],
      default: "public"
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
      index: true
    },
    rsvpEnabled: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);

