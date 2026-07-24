import { z } from "zod";

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string({ message: "Coupon code is required" }).min(1),
    discountType: z.enum(["PERCENT", "FLAT"], { message: "Invalid discount type" }),
    value: z.number({ message: "Value is required" }).positive("Value must be positive"),
    maxDiscount: z.number().int().positive().optional(),
    minOrder: z.number().int().nonnegative().optional(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});