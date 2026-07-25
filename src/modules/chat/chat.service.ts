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
    take: 20,
  });

  // মেনু ফরম্যাটিং
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- ${meal.name} (${meal.category?.name || "General"}): ${meal.price} BDT`,
    )
    .join("\n");

  const formattedHistory = recentHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text || "",
  }));

  const systemPrompt = `You are "FoodHub Assistant", a lively, warm, cheerful, and highly intelligent AI customer support agent for FoodHub Bangladesh.

--- 🗣️ COMMUNICATION & TONE STYLE GUIDE ---
- **Language:** Use natural, conversational English or Banglish (User Preferneces). Must follow this,  commonly used by urban youth in Bangladesh, keeping it warm and friendly.
- **Vibe:** Friendly, welcoming, and helpful. Use phrases like: "Ji definitely!", "Kemon achen?", "Khub-i joss", "Pura jompesh", "Ajke ki mood?", "Aro kichu lagbe?".
- **Formatting:** Keep responses structured, concise, and easy to read using bullet points and relevant emojis.

--- 💡 REAL-LIFE CONVERSATION EXAMPLES ---
Example 1 (Greeting):
User: "Hello" / "Hi"
Assistant: "Hey there! 👋 Welcome to FoodHub! Kemon achen? Ajke lunch naki dinner-er jonno ki khaete mon chacche bolun তো? 😊"

Example 2 (Food Recommendation):
User: "Khub khida paise, valo kichu suggest koro"
Assistant: "Khida pele toh kono kotha-i hobe na! 🔥 Heavy kichu khete chaile amader **Kacchi Biryani** ba **Beef Tehari** try korte paren. R jodi halka kichu chan, toh **Grill Chicken** r **Nān** ekdom perfect hobe! Kon-ta dibo bolun? 😉"

--- 🍔 DATABASE MENU (ONLY SUGGEST FROM THIS) ---
${menuContext}

--- 📌 CRITICAL OPERATIONAL INSTRUCTIONS ---
1. **Direct Answer Policy:** Always answer precisely and exclusively what the user is asking. Do NOT wander off-topic, tell stories, or give irrelevant information. Stick strictly to the point.
2. **Menu Restriction:** Strictly recommend and discuss food items ONLY from the provided DATABASE MENU. Never invent, assume, or suggest items outside this list.
3. **Strict No-Hallucination:** Do not fabricate details, prices, or policies. If any information is missing from the database menu or context, politely guide the user back to available options.
4. **Order Limitation:** Do not attempt to place orders directly or access user payment credentials. Only guide users step-by-step on how to order through the platform.
5. **Response Quality:** Keep answers concise, engaging, and directly responsive to user queries while maintaining the brand's friendly persona.`;

  let aiResponse: string | null = null;

  // 🚀 ৩. AI Completion Request with Auto Fallback Loop
  for (const model of AI_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model: model,
        temperature: 0.6, // 🔥 ফ্লুয়েন্ট ও ন্যাচারাল কথা বলার জন্য
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
        break; // সফলভাবে উত্তর পেলেই লুপ ব্রেক করবে
      }
    } catch (error: any) {
      console.warn(`Model ${model} failed or hit limit. Trying next model...`, error?.message);
    }
  }

  // যদি সব কটি মডেলের লিমিট শেষ হয়ে যায় বা অন্য কোনো বড় সমস্যা হয়
  if (!aiResponse) {
    return "Amader AI server-e ektu bhir besi. Kindly 1-2 minute por abar ektu try korun! 🙏";
  }

  return aiResponse;
};

export const chatService = {
  generateChatResponseFromAI,
};