import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    phone: z
      .string({ message: "Phone number must be a string" })
      .length(11, "Phone number must be exactly 11 digits!")
      .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number!")
      .optional(),
    image: z.string().url("Invalid image URL").optional(),
  }),
});