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
  // ১. category-এর ভেতর থেকে specific field (যেমন: name) সিলেক্ট করা
  const availableMeals = await prisma.meals.findMany({
    select: {
      name: true,
      price: true,
      category: {
        select: {
          name: true, // 👈 ক্যাটাগরির নামের ফিল্ড যদি 'name' না হয়ে 'title' হয়, তবে 'title: true' দেবে
        },
      },
    },
    take: 15,
  });

  // ২. meal.category?.name ব্যবহার করা
  const menuContext = availableMeals
    .map(
      (meal) =>
        `- Name: ${meal.name}, Category: ${meal.category?.name || "General"}, Price: ${meal.price} BDT`
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