import { Router } from "express";
import * as memberController from "../controllers/memberController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadProfilePicture } from "../middleware/upload.js";

const router = Router();

// All member routes require authentication
router.use(authenticate);

// Member's own profile
router.get("/profile", memberController.getProfile);
router.put("/profile", uploadProfilePicture.single("profilePicture"), memberController.updateMember);

// Search members
router.get("/search/query", memberController.searchMembers);

// List members (admin only)
router.get("/", authorize(["admin", "super-admin"]), memberController.listMembers);

// Member stats
router.get("/:id/stats", memberController.getMemberStats);

// Get member by ID (admin only)
router.get("/:id", authorize(["admin", "super-admin"]), memberController.getMemberById);

// Update member by ID (admin only)
router.put("/:id", authorize(["admin", "super-admin"]), uploadProfilePicture.single("profilePicture"), memberController.updateMember);

// Delete member (admin only)
router.delete("/:id", authorize(["admin", "super-admin"]), memberController.deleteMember);

// Restore member (admin only)
router.post("/:id/restore", authorize(["admin", "super-admin"]), memberController.restoreMember);

export default router;
