import express from "express";
import { providerController } from "./provider.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";

const router = express.Router();

router.get("/",providerController.getAllProvider)
router.get("/orders",auth(UserRole.PROVIDER),providerController.getProviderOrder)
router.patch("/orders/:orderId",auth(UserRole.PROVIDER),providerController.updateOrderStatus)

router.patch("/profile/:id",auth(UserRole.PROVIDER) ,providerController.updateProfile);


export const providerRouter= router;

