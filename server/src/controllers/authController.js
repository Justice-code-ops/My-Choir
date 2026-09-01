import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken, generatePasswordResetToken, hashPasswordResetToken } from "../utils/tokens.js";
import * as authService from "../services/authService.js";
import { recordAudit } from "../services/auditService.js";
import { env } from "../config/env.js";
import { isEmailConfigured, sendPasswordResetEmail } from "../services/emailService.js";

export const register = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Profile picture is required for registration");
  }

  const { user, member } = await authService.registerMember({
    body: req.body,
    file: req.file
  });

  // Record audit
  await recordAudit(req, "MEMBER_REGISTERED", "Member", member._id, {
    email: user.email
  });

  // Create welcome notification
  await Notification.create({
    recipient: user.id,
    audience: "single",
    title: "Registration Received",
    message: "Your registration has been received. Please wait for admin approval.",
    type: "system"
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. Please wait for admin approval.",
    data: {
      userId: user.id,
      memberId: member._id,
      email: user.email,
      status: user.status
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash").populate("member");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "approved") {
    throw new ApiError(403, `Your account is ${user.status}. Please wait for admin approval.`);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Record audit
  await recordAudit(req, "USER_LOGIN", "User", user._id, {});

  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    message: "Login successful",
    token,
    data: authService.serializeUser(user)
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  // Record audit
  await recordAudit(req, "USER_LOGOUT", "User", req.user._id, {});

  res.json({
    success: true,
    message: "Logout successful"
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("member");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    success: true,
    data: authService.serializeUser(user)
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const canSendResetEmail = isEmailConfigured();

  if (env.nodeEnv === "production" && !canSendResetEmail) {
    throw new ApiError(503, "Password reset email is not configured");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({
      success: true,
      message: "If an account exists with that email, you will receive a password reset link."
    });
  }

  const resetToken = generatePasswordResetToken();
  user.passwordResetToken = hashPasswordResetToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();

  const resetUrl = `${env.clientUrl}/auth/reset-password?token=${resetToken}`;

  if (canSendResetEmail) {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl
    });
  }

  const response = {
    success: true,
    message: "If an account exists with that email, you will receive a password reset link."
  };

  if (env.nodeEnv !== "production" && !canSendResetEmail) {
    response.resetUrl = resetUrl;
  }

  res.json(response);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  const user = await User.findOne({
    passwordResetToken: hashPasswordResetToken(token),
    passwordResetExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.passwordHash = await authService.hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // Record audit
  await recordAudit(req, "PASSWORD_RESET", "User", user._id, {});

  res.json({
    success: true,
    message: "Password has been reset successfully"
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });
  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  const allowedFields = [
    "phone",
    "address",
    "occupation",
    "nextOfKin",
    "instrument",
    "emergencyNotes"
  ];

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      member[key] = req.body[key];
    }
  });

  await member.save();

  // Record audit
  await recordAudit(req, "PROFILE_UPDATED", "Member", member._id, {
    fields: allowedFields
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: member
  });
});
