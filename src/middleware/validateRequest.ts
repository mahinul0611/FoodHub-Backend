import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 👇 শুধু req.body কে parse করা হচ্ছে (যেহেতু তুমি বডি ডেটা ভ্যালিড করতে চাও)
      req.body = await schema.parseAsync(req.body);
      
      return next(); // সব ঠিক থাকলে কন্ট্রোলারে যাবে
    } catch (err: any) {
      next(err); // গ্লোবাল এরর হ্যান্ডলারে পাঠিয়ে দিবে
    }
  };
};

export default validateRequest;