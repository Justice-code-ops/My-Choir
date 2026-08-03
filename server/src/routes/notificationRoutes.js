import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark as read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all as read
router.patch("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
