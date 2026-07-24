import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    address: z.string({ message: "Address is required" }).min(1, "Address cannot be empty"),
    contactNumber: z
      .string({ message: "Contact number is required" })
      .length(11, "Phone number must be exactly 11 digits!")
      .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number!"),
    paymentMethod: z.enum(["COD", "SSLCOMMERZ", "STRIPE"]).optional(),
    couponCode: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"],
      { message: "Invalid order status" }
    ),
  }),
});