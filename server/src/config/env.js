import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const csv = (value, fallback = []) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : fallback;

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voice_of_light",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresDays: toNumber(process.env.JWT_COOKIE_EXPIRES_DAYS, 7),
  bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 12),
  monthlyDue: toNumber(process.env.MONTHLY_DUE, 500),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  publicAppUrl: process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || "http://localhost:5173",
  corsOrigins: csv(process.env.CORS_ORIGINS, ["http://localhost:5173"]),
  maxFileSizeMb: toNumber(process.env.MAX_FILE_SIZE_MB, 5),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  payments: {
    provider: process.env.PAYMENT_PROVIDER,
    publicKey: process.env.PAYMENT_PUBLIC_KEY,
    secretKey: process.env.PAYMENT_SECRET_KEY
  }
};

export const validateEnv = () => {
  if (env.nodeEnv === "production") {
    const missing = [];
    if (!process.env.MONGO_URI) missing.push("MONGO_URI");
    if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
    if (missing.length) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }
};

