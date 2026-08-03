import { Notification } from "../models/Notification.js";

export const createNotification = async ({
  recipient,
  audience = "single",
  title,
  message,
  type = "system",
  actionUrl,
  metadata
}) =>
  Notification.create({
    recipient,
    audience,
    title,
    message,
    type,
    actionUrl,
    metadata
  });

export const notifyApprovalChange = (user, status, note) =>
  createNotification({
    recipient: user._id,
    title: `Registration ${status}`,
    message: note || `Your choir registration is now marked as ${status}.`,
    type: "approval",
    actionUrl: "/member/dashboard"
  });

