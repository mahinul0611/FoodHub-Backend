import { Router } from "express";
import { paymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

const router = Router();


router.get("/stripe/success", paymentController.stripeSuccess);
router.get("/stripe/cancel", paymentController.stripeCancel);

router.post("/init", auth(UserRole.USER), paymentController.init);

// Niche gulo SSLCommerz er server/browser theke ashe — auth NAI, eta ichakrito
router.post("/success", paymentController.success);
router.post("/fail", paymentController.fail);
router.post("/cancel", paymentController.cancel);
router.post("/ipn", paymentController.ipn);

export const paymentRoutes = router;