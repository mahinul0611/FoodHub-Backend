import { Router } from "express";
import { complaintController } from "./complaint.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../lib/auth";
import { createComplaintSchema } from "./complaint.validation";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

router.post("/", auth(UserRole.USER),validateRequest(createComplaintSchema), complaintController.create);
router.get("/my", auth(UserRole.USER), complaintController.my);
router.get("/provider", auth(UserRole.PROVIDER), complaintController.provider);
router.get("/admin", auth(UserRole.ADMIN), complaintController.admin);
router.patch(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  complaintController.update,
);

export const complaintRoutes = router;