import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedDocumentTypes = ["application/pdf"];
const allowedMediaTypes = ["audio/mpeg", "audio/wav", "video/mp4", "video/webm"];

const fileFilter = (_req, file, callback) => {
  const accepted = [...allowedImageTypes, ...allowedDocumentTypes, ...allowedMediaTypes];
  if (!accepted.includes(file.mimetype)) {
    return callback(new ApiError(400, "Unsupported file type"));
  }
  callback(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter
});

export const imageOnlyUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return callback(new ApiError(400, "Only JPG, PNG, and WEBP images are accepted"));
    }
    callback(null, true);
  }
});

// Alias for profile picture uploads
export const uploadProfilePicture = imageOnlyUpload;

