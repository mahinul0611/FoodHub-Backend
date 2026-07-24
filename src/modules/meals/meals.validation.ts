import { z } from "zod";

export const createMealSchema = z.object({
  body: z.object({
    name: z.string({ message: "Meal name is required" }).min(1, "Meal name is required").max(225),
    categoryId: z.string({ message: "Category ID is required" }),
    price: z.number({ message: "Price is required" }).positive("Price must be a positive number"),
    quantity: z.number({ message: "Quantity is required" }).int().nonnegative("Quantity cannot be negative"),
    image: z.string().url("Invalid image URL").optional(),
    description: z.string({ message: "Description is required" }).min(1, "Description is required"),
    isOnDiet: z.boolean({ message: "isOnDiet field is required" }),
    status: z.enum(["AVAILABLE", "STOCKOUT"]).optional(),
  }),
});

export const updateMealSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(225).optional(),
    categoryId: z.string().optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().nonnegative().optional(),
    image: z.string().url().optional(),
    description: z.string().min(1).optional(),
    isOnDiet: z.boolean().optional(),
    status: z.enum(["AVAILABLE", "STOCKOUT"]).optional(),
  }),
});