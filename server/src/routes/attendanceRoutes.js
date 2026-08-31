import { Router } from "express";
import * as attendanceController from "../controllers/attendanceController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

// Check in and attendance recording are admin-managed.
router.post(
  "/check-in",
  authorize(["admin", "super-admin"]),
  [
    body("memberId").notEmpty(),
    body("mode").optional().isIn(["qr", "code", "manual"]),
    body("code").optional().trim()
  ],
  validate,
  attendanceController.checkIn
);

// Record attendance manually (admin only)
router.post(
  "/record",
  authorize(["admin", "super-admin"]),
  [
    body("memberId").notEmpty(),
    body("status").isIn(["present", "late", "absent", "excused"]),
    body("checkedInAt").optional().isISO8601(),
    body("eventId").optional().isMongoId(),
    body("notes").optional().trim().isLength({ max: 500 })
  ],
  validate,
  attendanceController.recordAttendance
);

// Get attendance history for a member
router.get("/:memberId/history", attendanceController.getAttendanceHistory);

// Get attendance stats for a member
router.get("/:memberId/stats", attendanceController.getAttendanceStats);

// Generate attendance report (admin only)
router.get("/report", authorize(["admin", "super-admin"]), attendanceController.generateAttendanceReport);

export default router;
