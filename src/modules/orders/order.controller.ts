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
    const { address, contactNumber, items,couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    console.log("🔥 Order Data Received:", data);
  console.log("🔥 Coupon Code:", data.couponCode);
    const order = await orderService.createOrder(userId!, {
      address,
      contactNumber,
      items,
      couponCode
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


const cancelMyOrder = async (req: Request, res: Response) => {
  const user = (req as any).user; // ⚠️ tomar onno controller e user jevabe newa hoy, EXACT sevabe nao
  const orderId = req.params.id;
  if (typeof orderId !== "string" || !orderId) {
    return res
      .status(400)
      .json({ success: false, message: "Order id is required!" });
  }
  try {
    const order = await orderService.cancelMyOrder(user.id, orderId);
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to cancel order!",
    });
  }
};



export const orderController = {
  createOrder,
  getMyOrders,
  cancelMyOrder
};
