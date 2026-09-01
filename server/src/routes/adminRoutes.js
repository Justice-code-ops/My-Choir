import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import * as contentController from "../controllers/contentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate.js";
import { ROLES } from "../constants/index.js";

const router = Router();

const blogRules = [
  body("title").optional().trim().notEmpty().withMessage("Title is required"),
  body("summary").optional().trim().isLength({ max: 300 }).withMessage("Summary must be 300 characters or fewer"),
  body("body").optional().trim().notEmpty().withMessage("Body is required"),
  body("visibility").optional().isIn(["public", "members", "admins"]),
  body("published").optional().isBoolean().toBoolean(),
  body("tags").optional()
];

const roleRules = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  body("role").trim().isIn([ROLES.MEMBER, ROLES.ADMIN]).withMessage("Role must be member or admin"),
  body("choirPost").optional({ checkFalsy: true }).trim().isLength({ max: 80 }).withMessage("Official post must be 80 characters or fewer")
];

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

// Role management
router.patch("/users/:userId/role", roleRules, validate, adminController.updateUserRole);

// Export member list as CSV
router.get("/export/members", adminController.exportMemberList);

// Blog management
router.get("/blog", contentController.listBlogPosts);
router.post("/blog", blogRules, validate, contentController.createBlogPost);
router.put("/blog/:id", blogRules, validate, contentController.updateBlogPost);
router.delete("/blog/:id", contentController.deleteBlogPost);

export default router;
