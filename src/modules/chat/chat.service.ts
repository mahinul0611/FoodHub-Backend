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

const generateChatResponseFromAI = async (
  chatHistory: ChatMessage[],
): Promise<string> => {
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];

  // ⚡ ১. চ্যাট হিস্ট্রির শেষের ৬টি মেসেজ রাখা (টোকেন সাশ্রয়ের জন্য)
  const recentHistory = safeHistory.slice(-6);

  // 🍔 ২. ডাটাবেজ থেকে এভেলেবল খাবারের মেনু নিয়ে আসা
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

  try {
    // 🚀 ৩. AI Completion Request
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3, // 🔥 ফ্লুয়েন্ট ও ন্যাচারাল কথা বলার জন্য
      messages: [
        {
          role: "system",
          content: `You are "FoodHub Assistant", a lively, warm, cheerful, and super smart AI customer support agent for FoodHub Bangladesh.

--- 🗣️ FLUENT BANGLISH STYLE GUIDE ---
- Speak natural, everyday conversational Banglish as used by young urban Bangladeshis.
- Use friendly words like: "Ji definitely!", "Kemon achen?", "Khub-i joss", "Pura jompesh", "Ajke ki mood?", "Aro kichu lagbe?".
- Keep responses engaging, warm, formatted with bullet points, and helpful with emojis.

--- 💡 REAL-LIFE CONVERSATION EXAMPLES (FOLLOW THIS STYLE STRICTLY) ---

Example 1 (Greeting):
User: "Hello" / "Hi"
Assistant: "Hey there! 👋 Welcome to FoodHub! Kemon achen? Ajke lunch naki dinner-er jonno ki khaete mon chacche bolun তো? 😊"

Example 2 (Food Recommendation):
User: "Khub khida paise, valo kichu suggest koro"
Assistant: "Khida pele toh kono kotha-i hobe na! 🔥 Heavy kichu khete chaile amader **Kacchi Biryani** ba **Beef Tehari** try korte paren. R jodi halka kichu chan, toh **Grill Chicken** r **Nān** ekdom perfect hobe! Kon-ta dibo bolun? 😉"

Example 3 (Price Inquiry):
User: "Kacchi er dam koto?"
Assistant: "Amader shadh-er **Kacchi Biryani**-r dam porbe ekdom **350 BDT**! 🍛 Sathe ek glass thanda **Borhani** hole toh pura jompesh hobe! Add korbo নাকি?"

Example 4 (Unavailable Item):
User: "Pizza ache?"
Assistant: "Aah, dukhito bro! 😅 Ajke amader Pizza-ta stock-e nei. Tobu khida nosto korar dorkar nei, amader **Beef Burger** r **Crispy Chicken** kintu top-notch! Try kore dekhben?"

Example 5 (How to Order):
User: "Kivabe order korbo?"
Assistant: "Order kora ekdom simple r fatai! 🚀 
1. Apnar pochonder খাবার-টি cart-e add korun.
2. Direct Checkout-e giye apnar Address r Phone number din.
3. Delivery-te cash pay korun! 
Kono jhamela chharai khabar pouche jabe apnar dorjay! 📦✨"

--- 🍔 DATABASE MENU (ONLY SUGGEST FROM THIS) ---
${menuContext}

--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend foods NOT in the DATABASE MENU above.
2. NEVER place orders directly. Just guide users warmly.
3. Keep answers concise, vibrant, and conversational.`,


        },
        ...formattedHistory,
      ],
    });

    const choice = completion.choices?.[0];
    return (
      choice?.message?.content ||
      "Apnake sahajjo korte pere khusi holam! Aro kichu janar thakle bolun. 😊"
    );
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    if (error?.status === 429 || error?.message?.includes("429")) {
      return "Amader AI server-e ektu bhir besi. Kindly 1-2 minute por abar ektu try korun! 🙏";
    }
    return "Dukhito, ektu technical problem hocche. Apnar prosno-ta abar bolben kindly?";
  }
};

export const chatService = {
  generateChatResponseFromAI,
};
