import type { Request, Response } from "express";
import { couponService } from "./coupon.service";

const validate = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body ?? {};
    if (typeof code !== "string" || !code.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required!" });
    }
    const result = await couponService.validateCoupon(
      code,
      Number(subtotal) || 0,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Invalid coupon code!",
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    return res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to create coupon!",
    });
  }
};

const list = async (_req: Request, res: Response) => {
  const coupons = await couponService.listCoupons();
  return res.status(200).json({ success: true, data: coupons });
};

const update = async (req: Request, res: Response) => {
  const couponId = req.params.id;
  if (typeof couponId !== "string" || !couponId) {
    return res
      .status(400)
      .json({ success: false, message: "Coupon id is required!" });
  }
  try {
    const coupon = await couponService.updateCoupon(couponId, {
      active: req.body?.active,
    });
    return res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to update coupon!",
    });
  }
};

export const couponController = { validate, create, list, update };