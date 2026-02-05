import express from "express";
import { meController } from "./me.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

const router = express.Router();

router.get("/",auth(UserRole.USER,UserRole.ADMIN,UserRole.PROVIDER) ,meController.getUserInfo);

export const meRouter = router;
