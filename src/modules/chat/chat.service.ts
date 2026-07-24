import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (
  message: string,
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a friendly and helpful AI customer support agent for FoodHub, an online food delivery platform. Help users with food recommendations, order tracking, restaurant inquiries, and general queries politely and concisely in a conversational tone.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return (
    completion.choices[0]?.message?.content ||
    "Sorry, I couldn't process that."
  );
};

export const chatService = {
  generateChatResponseFromAI,
};