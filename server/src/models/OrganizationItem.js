import mongoose from "mongoose";

const organizationItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["executive", "department", "value"],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: String,
    summary: String,
    biography: String,
    image: {
      url: String,
      publicId: String,
      provider: String
    },
    order: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export const OrganizationItem = mongoose.model("OrganizationItem", organizationItemSchema);

