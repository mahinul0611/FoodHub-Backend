import { Request, Response } from "express";
import { chatService } from "./chat.service";

const handleChatmessages = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ messages: "messages is required" });
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
      messages: error.messages || "Internal Server Error",
    });
  }
};

export const chatController = {
  handleChatmessages,
};
