import { Request, Response } from "express";
import { emailService } from "./email.service";
import { prisma } from "../../lib/prisma";

const triggerLoginAlert = async (req: Request, res: Response) => {
  try {
    const { userId, email, userName, time } = req.body;

    // 🛑 টাইপ সেফটির জন্য চেক করা
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "Unknown IP";
    const userAgent = req.headers["user-agent"] || "Unknown Device";

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    emailService.sendLoginAlert(
      user.email,
      user.name,
      ipAddress,
      userAgent,
      time,
    );

    return res
      .status(200)
      .json({ success: true, message: "Login alert processed" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to process login alert" });
  }
};

// অর্ডার প্লেস হওয়ার সময় যেভাবে অর্ডার ক্রিয়েট ও ইমেইল ট্রিগার করবেন:
const sendOrderConfirmation = async (req:Request, res:Response)=>{

  try {
    
  } catch (err:any) {
    res.status
  }




}



// অর্ডারের স্ট্যাটাস পরিবর্তন (যেমন DELIVERED হলে) করার সময় যেভাবে মেইল পাঠাবেন:

export const emailController = {
  triggerLoginAlert,
};
