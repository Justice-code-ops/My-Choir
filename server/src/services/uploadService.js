import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..", "..");

const extensionFromFile = (file) => {
  const fromName = path.extname(file.originalname || "");
  if (fromName) return fromName.toLowerCase();
  const [, subtype = "bin"] = (file.mimetype || "").split("/");
  return `.${subtype}`;
};

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          provider: "cloudinary",
          mimeType: file.mimetype
        });
      }
    );

    stream.end(file.buffer);
  });

const uploadLocally = async (file, folder) => {
  const uploadsPath = path.resolve(serverRoot, env.uploadDir, folder);
  await fs.mkdir(uploadsPath, { recursive: true });
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extensionFromFile(file)}`;
  const target = path.join(uploadsPath, safeName);
  await fs.writeFile(target, file.buffer);

  return {
    url: `/uploads/${folder}/${safeName}`,
    publicId: `${folder}/${safeName}`,
    provider: "local",
    mimeType: file.mimetype
  };
};

export const storeFile = async (file, folder = "library") => {
  if (!file) return null;
  if (isCloudinaryConfigured) return uploadToCloudinary(file, `voice-of-light/${folder}`);
  return uploadLocally(file, folder);
};

export const storeProfilePicture = (file) => storeFile(file, "profiles");
