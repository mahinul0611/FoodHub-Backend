import express from "express";
import { mealsController } from "./meals.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

const router = express.Router();

router.get("/", mealsController.getAllMeals);

router.post("/", mealsController.createMeal);

router.get("/:mealId", mealsController.getMealById);
router.put("/:mealId", auth(UserRole.PROVIDER), mealsController.updateMeals);
router.delete("/:mealId", auth(UserRole.PROVIDER), mealsController.deleteMeal);

export const mealsRouter = router;
