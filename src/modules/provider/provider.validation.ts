import { z } from "zod";

export const createProviderSchema = z.object({
  body: z.object({
    name: z.string({ message: "Provider/Restaurant name is required" }).min(1, "Name cannot be empty"),
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateProviderSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Invalid email format").optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});