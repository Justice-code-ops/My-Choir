import mongoose from "mongoose";
import { CONTENT_TYPES } from "../constants/index.js";

const contentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: CONTENT_TYPES,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },
    slug: {
      type: String,
      trim: true,
      index: true
    },
    summary: String,
    body: String,
    category: String,
    tags: [String],
    file: {
      url: String,
      publicId: String,
      provider: String,
      mimeType: String
    },
    coverImage: {
      url: String,
      publicId: String,
      provider: String
    },
    durationSeconds: Number,
    published: {
      type: Boolean,
      default: true,
      index: true
    },
    publishedAt: Date,
    visibility: {
      type: String,
      enum: ["public", "members", "admins"],
      default: "public"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

contentItemSchema.index({ type: 1, publishedAt: -1 });

export const ContentItem = mongoose.model("ContentItem", contentItemSchema);

