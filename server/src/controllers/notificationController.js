import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { read } = req.query;

  const filter = { recipient: req.user._id };
  if (read !== undefined) {
    filter.readAt = read === "true" ? { $ne: null } : null;
  }

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.json({
    success: true,
    message: "Notification marked as read",
    data: notification
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { readAt: new Date() }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.json({
    success: true,
    message: "Notification deleted"
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    readAt: null
  });

  res.json({
    success: true,
    data: { unreadCount: count }
  });
});
