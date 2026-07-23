import { orderController } from "./order.controller";
import { UserRole } from "../../lib/auth";
import express, { Request, Response } from "express";
import auth from "../../middleware/auth";

const router = express.Router();

router.get("/", auth(UserRole.USER), orderController.getMyOrders);

router.post("/", auth(UserRole.USER), orderController.createOrder);

router.patch("/:id/cancel", auth(UserRole.USER), orderController.cancelMyOrder);

export const orderRouter = router;
