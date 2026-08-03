import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

