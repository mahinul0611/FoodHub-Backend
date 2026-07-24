import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({
  apiKey, // 👈 এখন TypeScript নিশ্চিত যে এটি একটি string
});
 const generateChatResponseFromAI = async (
  message: string,
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      systemInstruction:
        "You are a friendly and helpful AI customer support agent for FoodHub, an online food delivery platform. Help users with food recommendations, order tracking, restaurant inquiries, and general queries politely and concisely in a conversational tone.",
    },
  });

  return response.text || "Sorry, I couldn't process that.";
};

export const chatService ={
generateChatResponseFromAI
}