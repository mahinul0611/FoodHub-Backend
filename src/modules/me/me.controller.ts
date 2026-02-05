import { Request, Response } from "express"
import { meServcie } from "./me.service";

const getUserInfo= async (req:Request,res:Response)=>{

    try{



      const user = (req as any).user

      if (!user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

      // console.log(user.id)


      const result = await meServcie.getUserInfo(user.id);
res.json({
    success:true,
    message:"User info fetched Successfully",
    data: result
  });
    }

    
   



     catch (error) {
        res.status(400).json({
            success:false,
            message:"User info fetching failed"
        })
    }

}




export const meController= {
    getUserInfo
}