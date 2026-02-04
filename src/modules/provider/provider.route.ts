import express from "express";
import { providerController } from "./provider.controller";

const router = express.Router();

router.get("/",providerController.getAllProvider)

router.patch("/profile/:id", providerController.updateProfile);

export const providerRouter= router;