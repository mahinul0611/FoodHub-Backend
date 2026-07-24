import express from "express";
import { meController } from "./me.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import validateRequest from "../../middleware/validateRequest";
import { updateUserSchema } from "../user/user.validation";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER),
  meController.getUserInfo,
);

router.put(
  "/me",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER), // যে ইউজার লগইন করা আছে তার টোকেন চেক করার জন্য
  validateRequest(updateUserSchema), // 👈 এখানে আপনার জড ভ্যালিডেশন কাজ করবে
  meController.updateMyProfile,
);

export const meRouter = router;
