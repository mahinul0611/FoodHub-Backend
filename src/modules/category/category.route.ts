import express from "express";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

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

router.put(
  "/category/:categoryId",
  auth(UserRole.ADMIN),
  categoryController.updateCategory,
);

router.post(
  "/category",
  auth(UserRole.ADMIN),
  categoryController.createCategory,
);

export const categoryRouter = router;
