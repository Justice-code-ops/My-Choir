import { Router } from "express";
import * as approvalController from "../controllers/approvalController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// All approval routes require authentication and admin role
router.use(authenticate);
router.use(authorize(["admin", "super-admin"]));

// Get pending approvals
router.get("/", approvalController.getPendingApprovals);

// Get approval stats
router.get("/stats", approvalController.getApprovalStats);

// Approve member
router.post(
  "/:id/approve",
  [body("note").optional().trim()],
  validate,
  approvalController.approveMember
);

// Reject member
router.post(
  "/:id/reject",
  [body("reason").trim().notEmpty().withMessage("Rejection reason is required")],
  validate,
  approvalController.rejectMember
);

// Request correction
router.post(
  "/:id/correct",
  [body("requiredCorrections").trim().notEmpty()],
  validate,
  approvalController.requestCorrection
);

export default router;
