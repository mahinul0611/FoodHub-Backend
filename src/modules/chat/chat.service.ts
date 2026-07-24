import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (message: string): Promise<string> => {
  // ১. Prisma দিয়ে ডাটাবেজ থেকে খাবার ফেচ করা
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

  // ২. ডাটাবেজের ডেটাকে ফরমেট করা
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Item: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`,
    )
    .join("\n");

  // ৩. Groq এপিআই কল (Few-Shot Prompting & Temperature Adjustment)
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.6, // 👈 0.6 দিলে রেসপন্স অনেক নিখুঁত, টু-দ্য-পয়েন্ট ও সুন্দর হয়
    messages: [
      {
        role: "system",
        content: `You are "FoodHub Assistant", a lively, friendly, and smart AI customer support agent for FoodHub Bangladesh.

--- 🗣️ LANGUAGE & TONE RULES ---
- Respond in natural, conversational, everyday Banglish (Bengali written in English alphabets).
- Sound like a real young support agent from Dhaka/Bangladesh (use words like "Ji!", "Apnar jonno", "Khabar-ta khub-i moja", "Order kore nin").
- Use bullet points and relevant emojis to make responses visually engaging.

--- 🍔 DATABASE MENU (ONLY SUGGEST FROM THIS) ---
${menuContext}

--- 💬 EXAMPLES OF HOW YOU MUST ANSWER ---

User: "kono biryani ache?"
Assistant: "Ji, amader kache biryani ache! 🍗\n\n- **Kacchi Biryani** (Kacchi Category) - 350 BDT\n\nTry kore দেখতে paren, khub-i popular item!"

User: "100 takar moddhe ki pabo?"
Assistant: "100 BDT-er moddhe amader kache eigula ache: 😋\n\n- **Dim Polao** - 60 BDT\n- **Ice Cream** - 100 BDT\n\nKonta order korben janan!"

User: "pizza ache?"
Assistant: "Dukhito! Amader menu-te ekhon Pizza available nei. 😔 Tobe apni amader **Egg Fried Rice** (120 BDT) ba **Grill Chicken** (110 BDT) try করতে paren!"

--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend any food item that is NOT present in the DATABASE MENU above.
2. If the asked item is unavailable, politely decline in Banglish and suggest an item from the menu.
3. Keep replies short, accurate, and structured.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content || "Sorry, I can't process now!."
  );
};

export const chatService = {
  generateChatResponseFromAI,
};
