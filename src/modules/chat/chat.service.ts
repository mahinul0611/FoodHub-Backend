import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({ apiKey });

const generateChatResponseFromAI = async (
  message: string,
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a friendly customer support AI agent for FoodHub. The user will often talk in Banglish (Bengali written using the English/Roman alphabet, e.g., 'Are na konta', 'kemon acho', 'kabar kobe ashbe'). Understand Banglish, Bangla, and English accurately. Always reply in clear, friendly Banglish (or English if the user asks in pure English). Keep replies short and helpful.",
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