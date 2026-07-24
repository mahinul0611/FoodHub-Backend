import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const generateChatResponseFromAI = async (
  chatHistory: ChatMessage[]
): Promise<string> => {
  // ⚠️ Safety Check: chatHistory যদি undefined বা অ্যারে না হয়, তবে ক্র্যাশ না করে খালি অ্যারে নিবে
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];

  // ১. ডাটাবেজ থেকে খাবার ফেচ করা
  const availableMeals = await prisma.meals.findMany({
    select: {
      name: true,
      price: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    take: 20,
  });

  // ২. ডাটাবেজের ডেটাকে টেক্সট ফরম্যাটে রূপান্তর
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Item: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`
    )
    .join("\n");

  // ৩. সেফলি চ্যাট হিস্ট্রি ফরম্যাট করা
  const formattedHistory = safeHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text,
  }));

  // ৪. Groq Call
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `You are "FoodHub Assistant", a polite, smart, and efficient AI customer support agent for FoodHub Bangladesh.

--- 🧠 CONTEXT & MEMORY INSTRUCTIONS ---
- Always maintain full conversation context using previous messages.
- DO NOT repeat yourself or send identical sentences.
- If the user asks follow-up questions (e.g., "eta koi pabo", "dam koto", "ar ki ache"), understand what item they were talking about previously and give relevant answers.

--- 🗣️ LANGUAGE & TONE ---
- Respond in natural, clean Banglish (Bengali words in Roman letters) or simple English if requested.
- Keep replies short, helpful, and natural (like a real human support agent in Bangladesh).

--- 🍔 DATABASE MENU (ONLY RECOMMEND FROM THIS) ---
${menuContext}

--- 📌 CRITICAL RULES ---
1. STRICTLY suggest items from the DATABASE MENU above. Never invent any food.
2. If an item is unavailable, politely decline in Banglish and suggest menu alternatives.
3. Keep answers clear, well-structured, and concise.`,
      },
      ...formattedHistory,
    ],
  });

  return (
    completion.choices[0]?.message?.content ||
    "Sorry, Your request could not be processed!"
  );
};

export const chatService = {
  generateChatResponseFromAI,
};