import express from "express";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import validateRequest from "../../middleware/validateRequest";
import { createCategorySchema, updateCategorySchema } from "./category.validation";

const router = express.Router();

router.get(
  "/category",
  auth(UserRole.ADMIN),
  categoryController.getAllCategory,
);
router.get(
  "/category/:categoryId",
  
  categoryController.getCategoryById,
);

router.post(
  "/category",
  auth(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);

router.put(
  "/category/:categoryId",
  auth(UserRole.ADMIN),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);



router.delete(
  "/category/:categoryId",
  auth(UserRole.ADMIN),
  categoryController.deleteCategory
);
export const categoryRouter = router;
