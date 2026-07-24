import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";
import { ChatMessage } from "./chat.types";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

// 🛠️ টাইপ-সেফ #ORDER ফরম্যাট পার্সিং
const parseOrderFormat = (text: string) => {
  const itemMatch = text.match(/Item:\s*(.+)/i);
  const qtyMatch = text.match(/Quantity:\s*(\d+)/i);
  const phoneMatch = text.match(/Phone:\s*(01[3-9]\d{8})/i);
  const addressMatch = text.match(/Address:\s*(.+)/i);

  // 👈 Safe optional chaining দিয়ে undefined এরর আটকানো হয়েছে
  const itemName = itemMatch?.[1]?.trim();
  const quantityStr = qtyMatch?.[1]?.trim();
  const phoneNumber = phoneMatch?.[1]?.trim();
  const address = addressMatch?.[1]?.trim();

  if (itemName && quantityStr && phoneNumber && address) {
    return {
      itemName,
      quantity: parseInt(quantityStr, 10),
      phoneNumber,
      address,
    };
  }
  return null;
};

const generateChatResponseFromAI = async (
  chatHistory: ChatMessage[],
  userId?: string
): Promise<string> => {
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];
  
  // 👈 টাইপ-সেফ অ্যারে ইনডেক্সিং
  const lastMsg = safeHistory.length > 0 ? safeHistory[safeHistory.length - 1] : undefined;
  const latestUserMessage = lastMsg?.text || "";

  // 🛑 ১. #ORDER ফরম্যাট প্রসেসিং
  if (latestUserMessage.startsWith("#ORDER")) {
    if (!userId) {
      return "Dukhito! Order place korar jonno apnake prothome account-e Log In korte hobe. Kindly Login kare abar try korun! 🔐";
    }

    const orderData = parseOrderFormat(latestUserMessage);

    if (!orderData) {
      return `❌ Apnar order format-ti thik nei! Kindly ei format-e likhun:\n\n#ORDER\nItem: [Food Name]\nQuantity: [Number]\nPhone: [01XXXXXXXXX]\nAddress: [Full Address]`;
    }

    try {
      const meal = await prisma.meals.findFirst({
        where: {
          name: { contains: orderData.itemName, mode: "insensitive" },
          isDeleted: false,
          status: "AVAILABLE",
        },
      });

      if (!meal) {
        return `Dukhito! "${orderData.itemName}" নামে কোনো খাবার বর্তমানে পাওয়া যাচ্ছে না।`;
      }

      const loggedInUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!loggedInUser) {
        return "Apnar user account-ti paowa jayni. Kindly re-login kore try korun.";
      }

      const totalAmount = Number(meal.price) * orderData.quantity;

      const newOrder = await prisma.orders.create({
        data: {
          userId: loggedInUser.id,
          providerId: meal.providerId,
          totalPrice: totalAmount,
          address: orderData.address,
          contactNumber: orderData.phoneNumber,
          status: "PLACED",
          paymentMethod: "COD",
          paymentStatus: "UNPAID",
          orderItems: {
            create: [
              {
                mealsId: meal.id,
                price: meal.price,
                quantity: orderData.quantity,
              },
            ],
          },
        },
      });

      return `Apanar order-ti successfully confirm hoye geche! 🎉\n\n📦 **Order Summary:**\n- **Item:** ${meal.name}\n- **Quantity:** ${orderData.quantity}\n- **Phone:** ${orderData.phoneNumber}\n- **Address:** ${orderData.address}\n- **Total Bill:** ${totalAmount} BDT\n- **Order ID:** #${newOrder.id}\n\nAmader delivery agent khub shighro apnar sathe jogajog korbe! Thank you! 😊`;
    } catch (error) {
      console.error("Order DB Error:", error);
      return "Dukhito, order-ti process kora jacche na.";
    }
  }

  // ⚡ ২. টোকেন বাঁচানোর জন্য চ্যাট হিস্ট্রি ফিল্টারিং
  const recentHistory = safeHistory.slice(-6);

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
    take: 15,
  });

  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Item: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`
    )
    .join("\n");

  const formattedHistory = recentHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text || "",
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are "FoodHub Assistant", a lively, friendly, and smart AI customer support agent for FoodHub Bangladesh.

--- 🗣 LANGUAGE, TONE & BEHAVIOR RULES ---
- Respond in natural, conversational, everyday Banglish (Bengali written in English alphabets).
- Don't use pure Bangla Language.. Use either English or Banglish
- Sound like a helpful support agent from Bangladesh.
- Use bullet points and relevant emojis to make responses visually engaging.
- Strictly adapt to what the user is asking and how they are writing. 
- DO NOT give irrelevant or out-of-context answers.

--- 🧠 CONTEXT & MEMORY INSTRUCTIONS ---
- Always maintain full conversation context using previous messages.
- DO NOT repeat yourself or send identical sentences.

--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend any food item that is NOT present in the DATABASE MENU above.
2. If the asked item is unavailable, politely decline in Banglish and suggest an item from the menu.
3. Keep replies short, accurate, structured, and helpful.


--- 🛒 MANDATORY ORDERING RULES ---
1. You CANNOT place orders directly by yourself.
2. ONLY LOGGED-IN USERS can order food.
3. If a user asks to order food, guide them to copy and send this EXACT format:



#ORDER
Item: [Exact Food Name]
Quantity: [Number]
Phone: [01XXXXXXXXX]
Address: [Full Delivery Address]

--- 🍔 DATABASE MENU ---
${menuContext}

--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend any food item that is NOT present in the DATABASE MENU above.
2. Keep replies short, accurate, structured, and helpful.`,
        },
        ...formattedHistory,
      ],
    });

    const choice = completion.choices?.[0];
    return choice?.message?.content || "Sorry, I can't process your request right now.";
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      return "Amader AI server-e ektu bhir besi. Kindly 2-3 minute por abar try korun! 🙏";
    }
    throw error;
  }
};

export const chatService = {
  generateChatResponseFromAI,
};