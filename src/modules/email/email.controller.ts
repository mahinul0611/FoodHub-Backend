import { Request, Response } from "express";
import { emailService } from "./email.service";

const triggerLoginAlert = async (req: Request, res: Response) => {
  try {
    const { email, userName, time } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";

    await emailService.sendLoginAlert(email, userName, ipAddress as string, time);
    return res.status(200).json({ success: true, message: "Login alert sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send email" });
  }
};

const triggerOrderConfirmation = async (req: Request, res: Response) => {
  try {
    const { email, userName, orderId, totalAmount } = req.body;
    await emailService.sendOrderConfirmation(email, userName, orderId, totalAmount);
    return res.status(200).json({ success: true, message: "Order confirmation sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send email" });
  }
};

export const emailController = {
  triggerLoginAlert,
  triggerOrderConfirmation
};