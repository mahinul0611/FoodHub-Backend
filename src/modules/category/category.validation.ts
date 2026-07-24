import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Category name is required" })
      .min(1, "Category name cannot be empty")
      .max(225),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Category name is required" })
      .min(1, "Category name cannot be empty")
      .max(225),
  }),
});
