import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";
import { ChatMessage } from "./chat.types";
import { chatTools, toolHandlers } from "./chat.tools";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (
  chatHistory: ChatMessage[],
): Promise<string> => {
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];

  const availableMeals = await prisma.meals.findMany({
    where: {
      isDeleted: false,
      status: "AVAILABLE",
    },
    select: {
      name: true,
      price: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    take: 25,
  });

  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Item: ${meal.name} | Category: ${meal.category?.name || "General"} | Price: ${meal.price} BDT`,
    )
    .join("\n");

  const formattedHistory = safeHistory.map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.text,
  }));

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4, // 👈 0.3 দিলে AI আরও বেশি রুল মেনে চলবে
    messages: [
      {
        role: "system",
        content: `You are "FoodHub Assistant", a lively, friendly, and smart AI customer support agent for FoodHub Bangladesh.

--- 🗣️ LANGUAGE, TONE & BEHAVIOR RULES ---
- Respond in natural, conversational, everyday Banglish (Bengali written in English alphabets).
- Sound like a helpful support agent from Bangladesh.
- Use bullet points and relevant emojis to make responses visually engaging.
- Strictly adapt to what the user is asking and how they are writing. 
- DO NOT give irrelevant or out-of-context answers.

--- 🧠 CONTEXT & MEMORY INSTRUCTIONS ---
- Always maintain full conversation context using previous messages.
- DO NOT repeat yourself or send identical sentences.


--- 🛑 STRICT TOOL CALLING RULES (PREVENT HALLUCINATIONS) ---
1. NEVER guess, hallucinate, invent, or fill dummy values for "phoneNumber" or "address".
2. IF USER PROVIDES ONLY ADDRESS: DO NOT invent a phone number. Politely ask for their 11-digit phone number first.
3. IF USER PROVIDES ONLY PHONE NUMBER: DO NOT invent an address. Politely ask for their delivery address first.
4. ONLY call "confirmFoodOrder" when BOTH an explicit valid phone number AND explicit address are present in the conversation.
--- 🛒 MANDATORY ORDERING RULES ---
1. To place an order, you MUST have ALL 4 required details:
   - Item Name
   - Quantity
   - Customer's Phone Number
   - Delivery Address
   
2. IF ANY DETAIL IS MISSING WHEN USER WANTS TO ORDER:
   - DO NOT call the "confirmFoodOrder" tool yet.
   - Politely ask the user to provide the missing details (e.g., "Order confirm korte apnar phone number r delivery address-ta diben please?").
3. ONLY call "confirmFoodOrder" tool AFTER collecting ALL required details.

--- 🛑 CRITICAL RULE TO PREVENT DUPLICATE ORDERS (MUST FOLLOW) ---
- ONLY call "confirmFoodOrder" if the user's LATEST/MOST RECENT message is explicitly asking to place a NEW order or providing the requested phone/address.
- IF THE ORDER HAS ALREADY BEEN CONFIRMED IN PREVIOUS MESSAGES: DO NOT CALL "confirmFoodOrder" AGAIN! Just answer the user's latest question normally (e.g. delivery time, general queries, thank you replies).

--- 🍔 DATABASE MENU (ONLY SUGGEST FROM THIS) ---
${menuContext}



--- 📌 CRITICAL INSTRUCTIONS ---
1. STRICTLY NEVER recommend any food item that is NOT present in the DATABASE MENU above.
2. If the asked item is unavailable, politely decline in Banglish and suggest an item from the menu.
3. Keep replies short, accurate, structured, and helpful.`,
      },
      ...formattedHistory,
    ],
    tools: chatTools,
    tool_choice: "auto",
  });

  const responseMessage = completion.choices[0]?.message;

  const toolCall = responseMessage?.tool_calls?.[0];

  if (toolCall) {
    const toolName = toolCall.function.name as keyof typeof toolHandlers;

    if (toolHandlers[toolName]) {
      const args = JSON.parse(toolCall.function.arguments);
      return await toolHandlers[toolName](args);
    }
  }

  return (
    responseMessage?.content || "Sorry, I can't process your request right now."
  );
};

export const chatService = {
  generateChatResponseFromAI,
};
