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

const updateMyProfile = async (req: Request, res: Response) => {
  try {
    // 👈 অথ মিডলওয়্যার থেকে ইউজার আইডি নেওয়া হচ্ছে (তোমার প্রজেক্টের নিয়ম অনুযায়ী req.user বা req.userId হতে পারে)
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access!",
      });
    }

    // 👈 সার্ভিসে ডেটা পাঠানো (যেহেতু Zod ভ্যালিডেশন হয়ে এসেছে, তাই req.body একদম ক্লিন)
    const result = await meServcie.updateMyInfo(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


export const meController= {
    getUserInfo,
    updateMyProfile
}