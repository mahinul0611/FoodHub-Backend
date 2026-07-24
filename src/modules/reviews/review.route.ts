import express from "express"
import { UserRole } from "../../lib/auth"
import auth from "../../middleware/auth"
import { reviewController } from "./review.controller"
import validateRequest from "../../middleware/validateRequest"
import { createReviewSchema } from "./review.validation"


const router = express.Router()


router.post("/",auth(UserRole.USER),validateRequest(createReviewSchema),reviewController.createReview)




export const reviewRouter = router
