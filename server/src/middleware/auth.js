import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { MEMBER_STATUSES } from "../constants/index.js";

const getToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.token;
};

export const authenticate = async (req, _res, next) => {
  try {
    const token = getToken(req);
    if (!token) throw new ApiError(401, "Authentication required");

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).populate("member");
    if (!user) throw new ApiError(401, "Invalid session");
    if (user.status === MEMBER_STATUSES.SUSPENDED) throw new ApiError(403, "Account suspended");

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
  }
};

// Alias for backward compatibility
export const requireAuth = authenticate;

export const requireApproved = (req, _res, next) => {
  if (req.user.status !== MEMBER_STATUSES.APPROVED) {
    return next(new ApiError(403, "Your membership must be approved before accessing this area"));
  }
  next();
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  next();
};

