import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entity: {
      type: String,
      required: true
    },
    entityId: String,
    ipAddress: String,
    userAgent: String,
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

