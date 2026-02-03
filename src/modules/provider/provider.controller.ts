import { Request, Response } from "express";
import { providerService } from "./provider.service";


 const getAllProvider = async (req:Request,res:Response)=>{

  try {
    
    const result = await providerService.getAllProvider();

    res.status(200).json({
      success:true,
      message:"Provider fetched Successfuly",
      data:result
    })

  } catch (error) {
    res.status(400).json({
      success:false,
      message:"Provider Fetching failed"
    })
  }


 }


const updateProfile = async (req: Request, res: Response) => {
  const {id}  = req.params; // URL থেকে userId নিচ্ছি (যেমন: /provider/profile/user-123)
  const updatedData = req.body;

  const result = await providerService.updateProfile(id as string, updatedData);

res.status(200).json({
    success: true,
    message: "Provider profile updated successfully",
    data: result,
})
};

export const providerController = {
  updateProfile,
  getAllProvider
};