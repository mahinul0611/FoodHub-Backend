import { z } from "zod";

export const createComplaintSchema = z.object({
  body: z.object({
    orderId: z.string({ message: "Order ID is required" }),
    category: z.enum(
      ["FOOD_QUALITY", "MISSING_ITEMS", "LATE_DELIVERY", "WRONG_ORDER", "OTHER"],
      { message: "Invalid complaint category" }
    ),
    description: z.string({ message: "Description is required" }).min(1, "Description cannot be empty"),
  }),
});