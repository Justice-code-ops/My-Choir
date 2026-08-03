import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

// Record payment (admin only)
router.post(
  "/",
  authorize(["admin", "super-admin"]),
  [
    body("memberId").notEmpty(),
    body("month").isInt({ min: 1, max: 12 }),
    body("year").isInt({ min: 2000, max: 2100 })
  ],
  validate,
  paymentController.recordPayment
);

// List all payments (admin only)
router.get("/", authorize(["admin", "super-admin"]), paymentController.listPayments);

// Get member's payment history
router.get("/:memberId/history", paymentController.getPaymentHistory);

// Get member's balance
router.get("/:memberId/balance", paymentController.getMemberBalance);

// Get payment receipt
router.get("/receipt/:receiptNumber", paymentController.getPaymentReceipt);

// Update payment status (admin only)
router.patch("/:id/status", authorize(["admin", "super-admin"]), paymentController.updatePaymentStatus);

export default router;
