import { Router } from "express";
import * as idCardController from "../controllers/idCardController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public route - verify ID card
router.get("/verify/:choirId", idCardController.verifyIDCard);

// Protected routes
router.use(authenticate);

// Get my ID card
router.get("/my-card", idCardController.getMemberIDCard);

// Generate ID card for a member (admin only)
router.get(
  "/:memberId/generate",
  authorize(["admin", "super-admin"]),
  idCardController.generateIDCard
);

// Download ID card
router.get("/:memberId/download", idCardController.downloadIDCard);

export default router;
