import { Request, Response } from "express";
import { chatService } from "./chat.service";

const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ message: "Message is required" });
    }

    // সার্ভিস থেকে এআই রেসপন্স নিয়ে আসা
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
