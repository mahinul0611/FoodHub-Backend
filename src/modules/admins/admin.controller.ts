import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { UserRole } from "../../lib/auth";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // console.log({user})

    if (user?.role !== UserRole.ADMIN) {
      throw new Error("Sorry You are unauthorized!");
    }

    const result = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "All User Data Fetched Successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "All User Data Fetched Failed",
    });
  }
};

const getUserById = async (req:Request,res:Response) => {
  

  try {
    

    const {userId}= req.params


    const result = await adminService.getUserById(userId as string);

    res.status(200).json({
      success:true,
      message:"User data fetched successfully",
      data:result
    })

  } catch (error:any) {
    
    res.status(404).json({
      success:false,
      message:"User data fetching failed",
      error: error.message
    })


  }
};


const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (user?.role !== UserRole.ADMIN) {
      throw new Error("Sorry You are unauthorized!");
    }

    const { userId } = req.params;

    // console.log({user});

    const { status } = req.body;

    const result = await adminService.updateUserStatus(
      userId as string,
      status,
    );

    res.status(200).json({
      success: true,
      message: "User Status Updated Successfull",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: " User Status Update Failed",
    });
  }
};

const getAdminStats = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // console.log({ user });

    if (user?.role !== UserRole.ADMIN) {
      throw new Error("Sorry You are unauthorized!");
    }

    const result = await adminService.getAdminStats();

    res.status(200).json({
      success: true,
      message: "All data fetched Successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "All  Data Fetching Failed",
    });
  }
};

 const getAllOrders = async (req: Request, res: Response) => {
  try {
   

    const user= req.user

    if(user?.role!== UserRole.ADMIN){
      throw new Error("Unauthorized!")
    }
    
    const result = await adminService.getAllOrders();

    res.status(200).json({
      success: true,
      message: "Order List fetched Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Order List not Found",
    });
  }
};


export const adminController = {
  getAllUsers,
  getAllOrders,
  getUserById,
  getAdminStats,
  updateUserStatus,
};
