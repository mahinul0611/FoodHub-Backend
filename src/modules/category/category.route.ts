import express from "express";
import { categoryController } from "./category.controller";


const router = express.Router()


router.get("/",categoryController.getAllCategory);


router.post("/",categoryController.createCategory);









export const categoryRouter= router