import express from "express";
import { mealsController } from "./meals.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import validateRequest from "../../middleware/validateRequest";
import { createMealSchema, updateMealSchema } from "./meals.validation";

const router = express.Router();

router.get("/", mealsController.getAllMeals);

router.post("/",auth(UserRole.PROVIDER) , validateRequest(createMealSchema),mealsController.createMeal);

router.get("/:mealId", mealsController.getMealById);
router.put("/:mealId", auth(UserRole.PROVIDER), validateRequest(updateMealSchema),mealsController.updateMeals);
router.delete("/:mealId", auth(UserRole.PROVIDER), mealsController.deleteMeal);

export const mealsRouter = router;
