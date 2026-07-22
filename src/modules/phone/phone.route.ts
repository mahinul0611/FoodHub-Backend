import { Router } from "express";
import { phoneController } from "./phone.controller";
import auth from "../../middleware/auth"
import { UserRole } from "../../lib/auth";

// review.route.ts e jei auth middleware import ache, seta e ekhane use koro

const router = Router();

// Review route e jevabe middleware boshano ache sevabe boshao, jemon:
// router.post("/send-otp", auth(UserRole.USER, UserRole.PROVIDER, UserRole.ADMIN), phoneController.sendOtp);
router.post("/send-otp",auth(UserRole.USER), phoneController.sendOtp);
router.post("/verify-otp",auth(UserRole.USER), phoneController.verifyOtp);

export const phoneRoutes = router;