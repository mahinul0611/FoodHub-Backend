import { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    // console.log(req)
    // const provider= req.body.user
    const result = await categoryService.createCategory(req.body);
 res.status(200).json({
      success: true,
      message: "Category Created Successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error,
    });
  }
};

export const categoryController = {
  createCategory,
};
