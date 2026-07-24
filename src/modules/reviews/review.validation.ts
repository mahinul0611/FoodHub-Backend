import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    ratings: z.number({ message: "Rating is required" }).int().min(1).max(5),
    mealsId: z.string({ message: "Meal ID is required" }),
    comment: z.string({ message: "Comment is required" }).min(1, "Comment cannot be empty"),
  }),
});