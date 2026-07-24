import { Request, Response } from "express";
import { chatService } from "./chat.service";

const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    // 🔑 Auth Middleware (Better-Auth/JWT) থেকে আসা Logged-in User-এর ID
    const userId = (req as any).user?.id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. 'messages' must be an array.",
      });
    }

    // 👈 সার্ভিস ফাংশনে messages-এর সাথে userId পাস করা হলো
    const reply = await chatService.generateChatResponseFromAI(messages);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const chatController = {
  handleChatMessage,
};