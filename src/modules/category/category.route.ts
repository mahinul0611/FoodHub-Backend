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

router.post(
  "/category",
  auth(UserRole.ADMIN),
  categoryController.createCategory,
);

router.put(
  "/category/:categoryId",
  auth(UserRole.ADMIN),
  categoryController.updateCategory,
);



router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  categoryController.deleteCategory
);
export const categoryRouter = router;
