import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const isOperational = err instanceof ApiError || err.isOperational;
  const shouldExposeStack = !isProduction && (!isOperational || statusCode >= 500);

  if (shouldExposeStack) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    details: err.details || undefined,
    stack: shouldExposeStack ? err.stack : undefined
  });
};
