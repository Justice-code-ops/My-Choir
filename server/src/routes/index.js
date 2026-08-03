import { Router } from "express";
import authRoutes from "./authRoutes.js";
import memberRoutes from "./memberRoutes.js";
import approvalRoutes from "./approvalRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import adminRoutes from "./adminRoutes.js";
import publicRoutes from "./publicRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import idCardRoutes from "./idCardRoutes.js";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Member routes
router.use("/members", memberRoutes);

// Approval workflow
router.use("/approvals", approvalRoutes);

// Payments
router.use("/payments", paymentRoutes);

// Attendance
router.use("/attendance", attendanceRoutes);

// Admin
router.use("/admin", adminRoutes);

// Notifications
router.use("/notifications", notificationRoutes);

// ID Card
router.use("/id-card", idCardRoutes);

// Public endpoints
router.use("/public", publicRoutes);

export default router;
