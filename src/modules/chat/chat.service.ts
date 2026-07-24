import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (
  message: string,
): Promise<string> => {
  // ১. Prisma দিয়ে ডাটাবেজ থেকে খাবার ফেচ করা
  const availableMeals = await prisma.meals.findMany({
    select: {
      name: true,
      price: true,
      category: true, // ক্যাটাগরি যদি রিলেশন হয় তবে category: { select: { name: true } } দিয়ে নিও
    },
    take: 15, // একসাথে প্রম্পটের জন্য ১৫টি খাবার ফেচ করবে
  });

  // ২. ডাটাবেজের ডেটাকে টেক্সট ফরম্যাটে সাজানো
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Name: ${meal.name}, Category: ${meal.category}, Price: ${meal.price} BDT`
    )
    .join("\n");

  // ৩. Groq এপিআই-তে প্রম্পট পাঠানো
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a friendly customer support AI agent for FoodHub, an online food delivery platform.
The user will often talk in Banglish (Bengali in English letters), Bangla, or English. Always respond in clear, friendly Banglish (or English if the user talks in pure English).

LIVE FOODHUB MENU FROM DATABASE:
${menuContext}

INSTRUCTIONS FOR FOOD SUGGESTIONS:
- Whenever user asks for food suggestions, recommendations, or budget options, strictly suggest from the "LIVE FOODHUB MENU" provided above.
- Mention the item name, category, and exact price in BDT.
- Do not make up any food item that is not in the list above.
- Keep responses concise, conversational, and natural.`,
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