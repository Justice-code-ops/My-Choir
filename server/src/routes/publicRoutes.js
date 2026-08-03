import { Router } from "express";
import * as publicController from "../controllers/publicController.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// Events
router.get("/events", publicController.getEvents);
router.get("/events/upcoming", publicController.getUpcomingEvents);
router.get("/events/:id", publicController.getEventById);

// Gallery
router.get("/gallery", publicController.getGallery);

// Blog
router.get("/blog", publicController.getBlog);
router.get("/blog/:slug", publicController.getBlogPost);

// Announcements
router.get("/announcements", publicController.getAnnouncements);

// Executives
router.get("/executives", publicController.getExecutives);

// Contact
router.post(
  "/contact",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("subject").trim().notEmpty(),
    body("message").trim().notEmpty(),
    body("phone").optional().trim()
  ],
  validate,
  publicController.submitContact
);

// Church info
router.get("/church-info", publicController.getChurchInfo);

export default router;
