import Groq from "groq-sdk";
import prisma from "../shared/prisma"; // 👈 তোমার প্রজেক্টের prisma instance

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (
  message: string,
): Promise<string> => {
  // ১. Prisma দিয়ে ডাটাবেজ থেকে খাবার ফেচ করা
  const availableMeals = await prisma.meal.findMany({
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

  // ২. ডাটাবেজের ডেটাকে ফরমেট করা
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Name: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`
    )
    .join("\n");

  // ৩. Groq এপিআই কল করা (আপডেট করা সিস্টেম প্রম্পটসহ)
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are "FoodHub Assistant", a super friendly, polite, and helpful AI customer support agent for FoodHub (an online food delivery app in Bangladesh).

--- 🗣️ LANGUAGE & FLUENCY RULES ---
1. Primary Language (Banglish): Respond in natural, fluent Banglish (Bengali words written in English/Roman alphabet) as used in casual Bangladeshi chat.
   - Good Examples: "Ji sure! Apanar jonno kichu moja kabar suggest korchi...", "Ei item-ta try kore dekhte paren!", "Budget-er moddhe chaitile amader kache eigula ache..."
   - Avoid robotic translations. Speak like a real human customer support staff in Bangladesh.
2. User Language Matching:
   - If user writes in Banglish (e.g., "kono biryani ache?"), reply in fluent Banglish.
   - If user writes in Bangla script (e.g., "কোন বিরিয়ানি আছে?"), reply in natural Banglish or polite Bangla.
   - If user writes in pure English (e.g., "What are the available foods?"), reply in simple English.

--- 🍔 LIVE FOODHUB MENU FROM DATABASE ---
${menuContext}

--- 📌 INSTRUCTIONS FOR FOOD RECOMMENDATIONS ---
- STRICT RULE: ALWAYS suggest foods ONLY from the "LIVE FOODHUB MENU" listed above. Never invent, hallucinate, or suggest any food outside this list.
- When suggesting food, clearly state:
  1. Item Name
  2. Category
  3. Price in BDT (e.g., "350 Taka" or "350 BDT")
- If a user asks for an item NOT in our menu (e.g., Pizza, if Pizza isn't in menu), say politely in Banglish that it's currently unavailable and suggest available alternatives from the menu.
- Keep replies short, well-structured (use bullet points for multiple items), and helpful.`,
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