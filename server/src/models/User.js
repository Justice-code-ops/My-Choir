import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MEMBER_STATUSES, ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER
    },
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUSES),
      default: MEMBER_STATUSES.PENDING,
      index: true
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member"
    },
    lastLoginAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiresAt;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);

