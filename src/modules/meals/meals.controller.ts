import {  Request, Response } from "express";
import { mealsService } from "./meals.service";
import { UserRole } from "../../lib/auth";

const createMeal = async (req: Request, res: Response) => {
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

const getAllMeals = async (req: Request, res: Response) => {
  const result = await mealsService.getAllMeals(req.query);

  res.status(200).json({
    success: true,
    message: "Meals retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
};

const getMealById = async (req: Request, res: Response) => {
  // console.log(req)

  try {
    const { mealId } = req.params;

    const result = await mealsService.getMealById(mealId as string);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Not Found",
    });
  }
};

const updateMeals = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    if (!user) {
      throw new Error("You are not authorized");
    }

    const { mealId } = req.params;

    // console.log({req})

    const isProvider = user.role === UserRole.PROVIDER;

    const result = await mealsService.updateMeals(
      mealId as string,
      req.body,
      user.id,
      isProvider,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Update Failed",
    });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    if (!user) {
      throw new Error("You are not authorized");
    }

    const { mealId } = req.params;

    const isProvider = user.role === UserRole.PROVIDER;

    const result = await mealsService.deleteMeal(
      mealId as string,
      user?.id,
      isProvider,
    );

    res.status(200).json({
      success: true,
      message:"Meal Deleted Successfully",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Deletion Failed",
    });
  }
};

export const mealsController = {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeals,
  deleteMeal,
};
