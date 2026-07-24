import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next(); // সব ঠিক থাকলে কন্ট্রোলারে যাবে
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: err.errors,
      });
    }
  };
};

export default validateRequest;