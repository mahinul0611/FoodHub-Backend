import { Router } from "express";
import { emailController } from "./email.controller";

const router = Router();

router.post("/login-alert", emailController.triggerLoginAlert);
router.post("/order-confirm", emailController.triggerOrderConfirmation);

export const emailRoutes = router;