import { NextFunction, Request, Response } from "express";
import { mealsService } from "./meals.service";

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealsService.createMeal(req.body);

    res.status(200).json({
      success: true,
      message: "Meals Created Successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error,
    });
  }
};

const getAllMeals = async (req:Request, res:Response) => {
  const result = await mealsService.getAllMeals(req.query);

  res.status(200).json({

    success: true,
    message: "Meals retrieved successfully",
    meta: result.meta,
    data: result.data,
  })
};



export const mealsController = {
  createMeal,
  getAllMeals,

};
