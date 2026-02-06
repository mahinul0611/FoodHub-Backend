import { Request, Response } from "express";
import { categoryService } from "./category.service";
import { UserRole } from "../../lib/auth";

const createCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== UserRole.ADMIN) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized!" });
    }

    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Category Creation failed",
      error: error.message,
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log({ user });
    if (user?.role !== UserRole.ADMIN) {
      throw new Error("Sorry! You are not allowed to update category!");
    }

    const { categoryId } = req.params;

    const result = await categoryService.updateCategory(
      categoryId as string,
      req.body,
    );
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategory();

    res.status(200).json({
      success: true,
      message: "All category fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error,
    });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    // const user = req.user;

    // if (user?.role !== UserRole.ADMIN) {
    //   throw new Error("Sorry You are not authorized!");
    // }

    const { categoryId } = req.params;

    const result = await categoryService.getCategoryById(categoryId as string);
    res.status(200).json({
      success: true,
      message: "Specific category Data fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Category Data fetching Failed",
      error: error.message,
    });
  }
};

export const categoryController = {
  createCategory,
  updateCategory,
  getAllCategory,
  getCategoryById,
};
