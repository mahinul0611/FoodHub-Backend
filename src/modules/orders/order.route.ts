import { orderController } from "./order.controller";
import { UserRole } from "../../lib/auth";
import express, { Request, Response } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { createOrderSchema } from "./order.validation";

const router = express.Router();

router.get("/", auth(UserRole.USER), orderController.getMyOrders);

router.post("/", auth(UserRole.USER), validateRequest(createOrderSchema),orderController.createOrder);

router.patch("/:id/cancel", auth(UserRole.USER), orderController.cancelMyOrder);

export const orderRouter = router;
