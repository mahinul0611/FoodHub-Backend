import express from "express";
import { adminController } from "./admin.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import validateRequest from "../../middleware/validateRequest";
import { updateUserSchema } from "../user/user.validation";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.get("/orders", auth(UserRole.ADMIN), adminController.getAllOrders);
router.get("/stats", auth(UserRole.ADMIN), adminController.getAdminStats);
router.get("/sessions", auth(UserRole.ADMIN), adminController.getLoginSessions);
router.get("/users/:userId", auth(UserRole.ADMIN), adminController.getUserById);
router.put(
  "/users/:userId",
  auth(UserRole.ADMIN),
  validateRequest(updateUserSchema),
  adminController.updateUserStatus,
);

// Delete route (asole soft delete hocche)
router.delete(
  "/providers/:providerId",
  auth(UserRole.ADMIN),
  adminController.removeProvider,
);

export const adminRouter = router;
