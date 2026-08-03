import mongoose from "mongoose";
import { MEMBER_STATUSES, VOICE_PARTS } from "../constants/index.js";
import { env } from "../config/env.js";

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      required: true
    },
    dob: Date,
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    occupation: String,
    nextOfKin: {
      name: String,
      phone: String,
      relationship: String
    },
    previousChoirExperience: String,
    voicePart: {
      type: String,
      enum: VOICE_PARTS,
      required: true,
      index: true
    },
    instrument: String,
    baptized: {
      type: Boolean,
      default: false
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    dateJoinedChurch: Date,
    dateJoinedChoir: Date,
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUSES),
      default: MEMBER_STATUSES.PENDING,
      index: true
    },
    profilePicture: {
      url: String,
      publicId: String,
      provider: {
        type: String,
        default: "local"
      }
    },
    choirId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    idCard: {
      issuedAt: Date,
      expiresAt: Date,
      signatureLabel: {
        type: String,
        default: "Choir Secretary"
      }
    },
    approval: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reviewedAt: Date,
      note: String
    },
    monthlyDue: {
      type: Number,
      default: () => env.monthlyDue
    },
    emergencyNotes: String
  },
  { timestamps: true }
);

memberSchema.index({ fullName: "text", email: "text", phone: "text", choirId: "text" });

export const Member = mongoose.model("Member", memberSchema);

