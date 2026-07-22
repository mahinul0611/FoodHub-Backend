import { Request, Response } from "express";
import { phoneService } from "./phone.service";

const sendOtp = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await phoneService.sendOtp(user.id);
    res.status(200).json({ success: true, message: result.message });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not send verification code",
      error: error.message,
    });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await phoneService.verifyOtp(user.id, req.body?.otp);
    res.status(200).json({ success: true, message: result.message });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Phone verification failed",
      error: error.message,
    });
  }
};

export const phoneController = { sendOtp, verifyOtp };