import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(["admin", "super-admin"]));

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Member stats
router.get("/members/stats", adminController.getMemberStats);

// Financial stats
router.get("/financial-stats", adminController.getFinancialStats);

// Audit logs
router.get("/audit-logs", adminController.getAuditLogs);

// Export member list as CSV
router.get("/export/members", adminController.exportMemberList);

export default router;
