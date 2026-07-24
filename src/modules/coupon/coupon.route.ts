import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import { couponController } from "./coupon.controller";
import validateRequest from "../../middleware/validateRequest";
import { createCouponSchema } from "./coupon.validation";

const router = Router();

router.post("/validate", auth(UserRole.USER), couponController.validate);
router.get("/", auth(UserRole.ADMIN), couponController.list);
router.post("/", auth(UserRole.ADMIN),validateRequest(createCouponSchema), couponController.create);
router.patch("/:id", auth(UserRole.ADMIN), couponController.update);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  couponController.deleteCoupon
);

export const couponRoutes = router;