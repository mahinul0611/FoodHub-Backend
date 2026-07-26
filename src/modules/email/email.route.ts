import { Router } from "express";
import { emailController } from "./email.controller";

const router = Router();

// ১. লগইন অ্যালার্ট রাউট
router.post("/login-alert", emailController.triggerLoginAlert);

// ২. অর্ডার ক্রিয়েট এবং কনফার্মেশন মেইল রাউট



// ৩. অর্ডার স্ট্যাটাস আপডেট এবং মেইল রাউট

export const emailRoutes = router;