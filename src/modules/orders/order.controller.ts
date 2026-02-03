// src/modules/orders/order.controller.ts
import { Request, Response } from "express";
import * as OrderService from "./order.service";

 const createOrder = async (req: Request, res: Response) => {
  try {
    // @ts-ignore (Better Auth সেশন থেকে আইডি)
    const userId = req.user.id; 
    const { address, contactNumber, items } = req.body;

    const result = await OrderService.createOrder(userId, {
      address,
      contactNumber,
      items
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const orderController = {
  createOrder
}