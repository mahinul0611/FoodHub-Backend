import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

// 🔄 মডেলগুলোর প্রায়োরিটি লিস্ট (স্মার্ট মডেল থেকে ব্যাকআপ মডেল)
const AI_MODELS = [
  "llama-3.1-70b-versatile", // ১. সবচেয়ে স্মার্ট মডেল
  "llama-3.1-8b-instant",     // ২. সুপার ফাস্ট ব্যাকআপ মডেল
  "mixtral-8x7b-32768"       // ৩. থার্ড ব্যাকআপ অপশন
];

const generateChatResponseFromAI = async (
  chatHistory: ChatMessage[],
): Promise<string> => {
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];

  // ⚡ ১. চ্যাট হিস্ট্রির শেষের ৬টি মেসেজ রাখা (টোকেন সাশ্রয়ের জন্য)
  const recentHistory = safeHistory.slice(-6);

  // 🍔 ২. ডাটাবেজ থেকে এভেলেবল খাবারের মেনু নিয়ে আসা
  const availableMeals = await prisma.meals.findMany({
    where: {
      isDeleted: false,
      status: "AVAILABLE",
    },
    select: {
      name: true,
      price: true,
      category: { select: { name: true } },
    },
    take: 25,
  });

  // মেনু ফরম্যাটিং
  const menuContext = availableMeals.length > 0
    ? availableMeals
        .map(
          (meal) =>
            `- ${meal.name} (${meal.category?.name || "General"}): ${meal.price} BDT`,
        )
        .join("\n")
    : "No food items currently available in the database.";

  const formattedHistory = recentHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text || "",
  }));

  // 🛡️ আপডেট করা সিস্টেম প্রম্পট (রেশনাল অফ-টপিক হ্যান্ডলিং সহ)
  const systemPrompt = `You are "FoodHub Assistant", a lively, warm, cheerful, and smart AI assistant for FoodHub Bangladesh.

--- 🗣️ COMMUNICATION & TONE STYLE GUIDE ---
- **Language:** Use natural, conversational Banglish (Mix of Bengali and English) commonly used by urban youth in Bangladesh, keeping it warm and friendly.
- **Vibe:** Friendly, conversational, and intelligent.
- **Formatting:** Keep responses structured, concise, and easy to read using bullet points and relevant emojis where necessary.

--- 🍔 DATABASE MENU (STRICT BOUNDARY FOR FOOD) ---
${menuContext}

--- 📌 CRITICAL RULES & INSTRUCTIONS ---
1. **Rational Off-Topic Handling:** If the user talks about something unrelated to food (e.g., traveling like "ghurte jabo", general chat, weather, or advice), give a smart, rational, and natural answer matching your warm persona. Do NOT awkwardly or forcefully steer them back to the FoodHub menu unless they specifically ask about food.
2. **Strict Menu Lockdown (For Food/Recommendations):** When a user asks for food suggestions, prices, or menu items, you are strictly forbidden from recommending or inventing any item that is NOT explicitly listed in the DATABASE MENU above. 
3. **Handling Missing Food Items:** If a user asks for a food item not present in the database menu, politely inform them that it's unavailable, and suggest alternatives directly from the DATABASE MENU.
4. **Order Limitation:** Do not attempt to place orders directly or access user payment credentials. Only guide users step-by-step on how to order through the platform.`;

  let aiResponse: string | null = null;

  // 🚀 ৩. AI Completion Request with Auto Fallback Loop
  for (const model of AI_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model: model,
        temperature: 0.3, // সামান্য বাড়িয়ে স্বাভাবিক ও গোছানো কথার জন্য ০.৩ করা হয়েছে
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...formattedHistory,
        ],
      });

      aiResponse = completion.choices?.[0]?.message?.content || null;
      if (aiResponse) {
        break; 
      }
    } catch (error: any) {
      console.warn(`Model ${model} failed or hit limit. Trying next model...`, error?.message);
    }
  }

  if (!aiResponse) {
    return "Amader AI server-e ektu bhir besi. Kindly 1-2 minute por abar ektu try korun! 🙏";
  }

  return aiResponse;
};

export const chatService = {
  generateChatResponseFromAI,
};