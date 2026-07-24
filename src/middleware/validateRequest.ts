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
     next(err);
    }
  };
};

export default validateRequest;