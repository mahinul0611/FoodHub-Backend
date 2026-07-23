import { Router } from "express";
import { complaintController } from "./complaint.controller";
// ⚠️ review.route.ts e je auth middleware use koro, seta ekhaneo import koro

const router = Router();

router.post("/", complaintController.create);
router.get("/my", complaintController.my);
router.get("/provider", complaintController.provider);
router.get("/admin", complaintController.admin);
router.patch("/:id", complaintController.update);

export const complaintRoutes = router;