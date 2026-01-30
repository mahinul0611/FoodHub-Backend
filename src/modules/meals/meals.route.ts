import express, { Request, Response }  from "express";
import { mealsController } from "./meals.controller";

const router = express.Router();

router.get("/", mealsController.getAllMeals);

router.post("/",mealsController.createMeal);









export const mealsRouter= router