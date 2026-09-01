import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const isEmailConfigured = () =>
  Boolean(env.smtp.host && env.smtp.port && env.smtp.user && env.smtp.pass);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error("SMTP is not configured");
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const safeUrl = escapeHtml(resetUrl);

  await getTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your Voice of Light password",
    text: [
      "You requested a password reset for your Voice of Light Chorale account.",
      "",
      "Open this link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request this reset, you can ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="color:#1d4ed8">Reset your password</h2>
        <p>You requested a password reset for your Voice of Light Chorale account.</p>
        <p>
          <a href="${safeUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break:break-all">${safeUrl}</p>
        <p>This link expires in 1 hour. If you did not request this reset, you can ignore this email.</p>
      </div>
    `
  });
};
