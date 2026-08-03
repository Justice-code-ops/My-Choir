import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(apiLimiter);

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.resolve(__dirname, "..", env.uploadDir)));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "Voice of Light API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

