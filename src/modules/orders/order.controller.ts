import { Request, Response } from "express";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response) => {
  try {
    // Assuming user ID is attached to req.user by your Better Auth middleware

    // console.log("Full User Object:", req.user);

    const userId = req.user?.id;
    if(!req.user){
    return res.status(400).json({ 
      success:false,
      message:"You are not allowed!"
     });

    }
    // console.log(userId);
    const { address, contactNumber, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    const order = await orderService.createOrder(userId!, {
      address,
      contactNumber,
      items,
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const orderController = {
  createOrder,
};
