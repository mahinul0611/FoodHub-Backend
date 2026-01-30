import express from "express";
import { providerController } from "./provider.controller";

const router = express.Router();

// আপাতত :id দিয়ে টেস্ট করছি (মিডলওয়্যার আসলে এটি req.user থেকে নেওয়া হবে)
router.patch("/profile/:id", providerController.updateProfile);

export const providerRouter= router;