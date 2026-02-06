import express from "express";
import { adminController } from "./admin.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.get("/orders",auth(UserRole.ADMIN),adminController.getAllOrders)
router.get("/stats", auth(UserRole.ADMIN), adminController.getAdminStats);
router.get("/users/:userId", auth(UserRole.ADMIN), adminController.getUserById);
router.put(
  "/users/:userId",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);



export const adminRouter = router;
