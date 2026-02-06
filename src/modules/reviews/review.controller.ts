import { Request, Response } from "express";
import { reviewService } from "./review.service";


const createReview= async (req:Request,res:Response)=>{


    try {
        

        const user= req.user

        // console.log({user})

        if (!user){
            throw new Error("You must login before creating Reviews!")
        }

        // const{payload}=req.body


        const result = await reviewService.createReview(user.id as string,req.body)

        res.status(201).json({
            success:true,
            message:"Your reviews Created Successfully",
            data: result
        })

    } catch (error:any) {
        

        res.status(400).json({
            success:false,
            message:"Review Creation Failed",
            error:error.message
        })
    }



}


export const reviewController={
    createReview
}