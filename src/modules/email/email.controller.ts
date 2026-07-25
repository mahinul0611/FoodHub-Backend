import { Request, Response } from "express";
import { emailService } from "./email.service";
import { prisma } from "../../lib/prisma";

const triggerLoginAlert = async (req: Request, res: Response) => {
  try {
    const { userId, email, userName, time } = req.body;

    // 🛑 টাইপ সেফটির জন্য চেক করা
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown IP";
    const userAgent = req.headers["user-agent"] || "Unknown Device";

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    emailService.sendLoginAlert(user.id, user.email, user.name, ipAddress, userAgent, time);

    return res.status(200).json({ success: true, message: "Login alert processed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to process login alert" });
  }
};

// অর্ডার প্লেস হওয়ার সময় যেভাবে অর্ডার ক্রিয়েট ও ইমেইল ট্রিগার করবেন:
const triggerOrderCreation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // অথেন্টিকেশন থেকে প্রাপ্ত ইউজার আইডি

    // 🛑 টাইপ সেফটির জন্য চেক করা (exactOptionalPropertyTypes সমাধান)
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID is missing" });
    }

    const { address, contactNumber, items, totalPrice } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prisma দিয়ে অর্ডার সেভ করা
    const newOrder = await prisma.orders.create({
      data: {
        userId,
        address,
        contactNumber,
        totalPrice,
        status: "PLACED",
        orderItems: {
          create: items.map((item: any) => ({
            mealsId: item.mealsId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // ব্যাকগ্রাউন্ডে অর্ডার কনফার্মেশন মেইল পাঠানো
    emailService.sendOrderConfirmation(user.email, user.name, newOrder.id, Number(newOrder.totalPrice));

    return res.status(201).json({ success: true, message: "Order placed successfully", data: newOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// অর্ডারের স্ট্যাটাস পরিবর্তন (যেমন DELIVERED হলে) করার সময় যেভাবে মেইল পাঠাবেন:
const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body; // নতুন স্ট্যাটাস (যেমন: DELIVERED, PREPARING ইত্যাদি)

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
      include: { user: true },
    });

    if (updatedOrder && updatedOrder.user) {
      // ব্যাকগ্রাউন্ডে স্ট্যাটাস আপডেট মেইল পাঠানো
      emailService.sendOrderStatus(
        updatedOrder.user.email,
        updatedOrder.user.name,
        updatedOrder.id,
        updatedOrder.status
      );
    }

    return res.status(200).json({ success: true, message: "Order status updated", data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

export const emailController = {
  triggerLoginAlert,
  triggerOrderCreation,
  updateOrderStatus,
};