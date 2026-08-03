import { Router } from "express";
import * as memberController from "../controllers/memberController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// All member routes require authentication
router.use(authenticate);

// Member's own profile
router.get("/profile", memberController.getProfile);
router.put("/profile", memberController.updateMember);

// Get member by ID (admin only)
router.get("/:id", authorize(["admin", "super-admin"]), memberController.getMemberById);

// List members (admin only)
router.get("/", authorize(["admin", "super-admin"]), memberController.listMembers);

// Search members
router.get("/search/query", memberController.searchMembers);

// Member stats
router.get("/:id/stats", memberController.getMemberStats);

// Delete member (admin only)
router.delete("/:id", authorize(["admin", "super-admin"]), memberController.deleteMember);

// Restore member (admin only)
router.post("/:id/restore", authorize(["admin", "super-admin"]), memberController.restoreMember);

export default router;
