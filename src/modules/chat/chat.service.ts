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
  chatHistory: ChatMessage[] // 👈 ১. এখানে single message-এর বদলে ChatMessage[] array রিসিভ করবে
): Promise<string> => {
  // ২. সেফটি চেক: chatHistory array না হলে খালি array নিবে
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];

  // ৩. Prisma দিয়ে খাবার ফেচ করা
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

  // ৪. খাবারগুলোর ফরমেটিং
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Item: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`
    )
    .join("\n");

  // ৫. ফ্রন্টএন্ড থেকে আসা মেসেজ হিস্ট্রিকে Groq-এর ফরম্যাটে কনভার্ট করা
  const formattedHistory = safeHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text,
  }));

  // ৬. Groq API Call
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `You are "FoodHub Assistant", a lively, friendly, and smart AI customer support agent for FoodHub Bangladesh.

--- 🗣️ LANGUAGE & TONE RULES ---
- Respond in natural, conversational, everyday Banglish (Bengali written in English alphabets).
- Sound like a real young support agent from Dhaka/Bangladesh (use words like "Ji!", "Apnar jonno", "Khabar-ta khub-i moja", "Order kore nin"). exactly egula bolba na ... erokom kore kotha bolba 
- Use bullet points and relevant emojis to make responses visually engaging.
- ar user jerokom chacche sherokom ba o jevabe likhtese shegula follow korba 
- ultapalta answer korba na 
- ja jante chaiche shegukar basis e answer korba
--- 🧠 CONTEXT & MEMORY INSTRUCTIONS ---
- Always maintain full conversation context using previous messages.
- DO NOT repeat yourself or send identical sentences.

--- 🍔 DATABASE MENU (ONLY SUGGEST FROM THIS) ---
${menuContext}

--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend any food item that is NOT present in the DATABASE MENU above.
2. If the asked item is unavailable, politely decline in Banglish and suggest an item from the menu.
3. Keep replies short, accurate, and structured.`,
      },
      ...formattedHistory, // 👈 ৭. পুরো চ্যাট হিস্ট্রি এআই-কে পাস করা হচ্ছে
    ],
  });

  return (
    completion.choices[0]?.message?.content || "Sorry, I can't process now!."
  );
};

export const chatService = {
  generateChatResponseFromAI,
};