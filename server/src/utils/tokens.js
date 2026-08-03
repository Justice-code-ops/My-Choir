import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      status: user.status
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: env.jwtCookieExpiresDays * 24 * 60 * 60 * 1000
});

export const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

export const verifyPasswordReset = (token) => {
  // Token is simple hash, no verification needed beyond checking in DB
  return !!token && token.length === 64;
};

