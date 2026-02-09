import { Request, Response } from "express";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response) => {
  try {


    const userId = req.user?.id;
    if(!req.user){
    return res.status(400).json({ 
      success:false,
      message:"You are not allowed!"
     });

    }
    const { address, contactNumber, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    const order = await orderService.createOrder(userId!, {
      address,
      contactNumber,
      items,
    });

    return res.status(201).json({
      success:true,
      message:"Order Created Successfully",
      data:order
    });
  } catch (error: any) {
    return res.status(400).json({ 
      success:false,
      message:"Order creation Failed",
      error: error.message });
  }
};


const getMyOrders= async(req:Request,res:Response)=>{


  try {
    

    const user= req.user!


    const result = await orderService.getMyOrders(user.id as string);


     res.status(201).json({
      success:true,
      message:"Customer Order fetched Successfully",
      data:result
    });


  } catch (error:any) {
    res.status(400).json({ 
      success:false,
      message:"Customer Order Fetching Failed",
      error: error.message });
  }


}






export const orderController = {
  createOrder,
  getMyOrders
};
