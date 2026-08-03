import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { uploadProfilePicture } from "../middleware/upload.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// Validation rules
const registerRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("fullName").trim().notEmpty(),
  body("phone").trim().notEmpty(),
  body("gender").isIn(["Male", "Female", "Other", "Prefer not to say"]),
  body("voicePart").isIn(["Soprano", "Alto", "Tenor", "Bass", "Instrumentalist"]),
  body("address").trim().notEmpty()
];

const loginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
];

// Public routes
router.post(
  "/register",
  uploadProfilePicture.single("profilePicture"),
  registerRules,
  validate,
  authController.register
);

router.post(
  "/login",
  loginRules,
  validate,
  authController.login
);

router.post(
  "/forgot-password",
  [body("email").isEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty(),
    body("password").isLength({ min: 8 }),
  ],
  validate,
  authController.resetPassword
);

// Protected routes
router.get("/me", authenticate, authController.getCurrentUser);
router.post("/logout", authenticate, authController.logout);
router.put("/profile", authenticate, authController.updateProfile);

export default router;
