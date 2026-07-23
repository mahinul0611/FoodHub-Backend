import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import { couponController } from "./coupon.controller";

const router = Router();

router.post("/validate", auth(UserRole.USER), couponController.validate);
router.get("/", auth(UserRole.ADMIN), couponController.list);
router.post("/", auth(UserRole.ADMIN), couponController.create);
router.patch("/:id", auth(UserRole.ADMIN), couponController.update);

export const couponRoutes = router;