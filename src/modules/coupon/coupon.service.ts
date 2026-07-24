import { Coupon } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma"; // ⚠️ tomar onno service er prisma import path er sathe match koro


export const DELIVERY_CHARGE = Number(process.env.DELIVERY_CHARGE ?? 60);

const calcDiscount = (coupon: Coupon, subtotal: number) => {
  let discount =
    coupon.discountType === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  return Math.min(discount, subtotal);
};








const validateCoupon = async (code: string, subtotal: number) => {
  const normalized = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
  });
  if (!coupon || !coupon.active) throw new Error("Invalid coupon code!");
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw new Error("This coupon has expired!");
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    throw new Error("This coupon has reached its usage limit!");
  if (subtotal < coupon.minOrder)
    throw new Error(
      `Minimum order amount for this coupon is ${coupon.minOrder}!`,
    );
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value,
    discount: calcDiscount(coupon, subtotal),
  };
};

const redeemCoupon = async (code: string) =>
  prisma.coupon.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  });

const createCoupon = async (data: {
  code: string;
  discountType: "PERCENT" | "FLAT";
  value: number;
  maxDiscount?: number;
  minOrder?: number;
  maxUses?: number;
  expiresAt?: string;
}) =>
  prisma.coupon.create({
    data: {
      code: data.code.trim().toUpperCase(),
      discountType: data.discountType,
      value: data.value,
      maxDiscount: data.maxDiscount ?? null,
      minOrder: data.minOrder ?? 0,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

const listCoupons = async () =>
  prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

const updateCoupon = async (id: string, data: { active?: boolean }) =>
  prisma.coupon.update({ where: { id }, data });

const deleteCoupon = async (id: string) => {
  const result = await prisma.coupon.delete({
    where: { id },
  });
  return result;
};


export const couponService = {
  validateCoupon,
  redeemCoupon,
  createCoupon,
  listCoupons,
  updateCoupon,
  deleteCoupon
};