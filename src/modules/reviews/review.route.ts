import express from "express"
import { UserRole } from "../../lib/auth"
import auth from "../../middleware/auth"
import { reviewController } from "./review.controller"


const router = express.Router()


router.post("/",auth(UserRole.USER),reviewController.createReview)




export const reviewRouter = router
