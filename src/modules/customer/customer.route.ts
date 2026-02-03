import express from "express";
import { customerController } from "./customer.controller";

const router = express.Router();

router.get("/me", customerController.getUserInfo);

export const customerRouter = router;
