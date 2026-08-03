import { AuditLog } from "../models/AuditLog.js";

export const recordAudit = async (req, action, entity, entityId, payload = {}) => {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      action,
      entity,
      entityId: entityId?.toString(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      ...payload
    });
  } catch (error) {
    console.error("Audit log failed", error);
  }
};

