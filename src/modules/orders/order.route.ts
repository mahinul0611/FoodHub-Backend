import { orderController } from "./order.controller";
import { UserRole } from "../../lib/auth";
import express from "express"
import auth from "../../middleware/auth";


const router = express.Router();


router.get("/",auth(UserRole.USER),orderController.getMyOrders)


router.post("/", auth(UserRole.USER), orderController.createOrder);

export const orderRouter = router;
