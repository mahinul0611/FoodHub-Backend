import express from "express";
import { providerController } from "./provider.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import validateRequest from "../../middleware/validateRequest";
import { updateOrderStatusSchema } from "../orders/order.validation";
import { updateProviderSchema } from "./provider.validation"; // 👈 প্রোভাইডার স্কিমা ইমপোর্ট করতে হবে

const router = express.Router();

router.get("/", providerController.getAllProvider);
router.get(
  "/orders",
  auth(UserRole.PROVIDER),
  providerController.getProviderOrder,
);
router.get("/nearby", providerController.getNearbyRestaurants);
router.get(
  "/analytics",
  auth(UserRole.PROVIDER),
  providerController.getAnalytics,
);

router.patch(
  "/orders/:orderId",
  auth(UserRole.PROVIDER),
  validateRequest(updateOrderStatusSchema),
  providerController.updateOrderStatus,
);

router.patch(
  "/profile/:id",
  auth(UserRole.PROVIDER),
  validateRequest(updateProviderSchema), // 👈 এখানে প্রোভাইডার স্কিমা বসবে
  providerController.updateProfile,
);

export const providerRouter = router;