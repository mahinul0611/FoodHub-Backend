import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";
import { OrderInput } from "./chat.types";

export const chatTools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "confirmFoodOrder",
      description:
        "Creates and confirms a food order ONLY when the user explicitly provides BOTH a valid contact phone number AND a full delivery address.",
      parameters: {
        type: "object",
        properties: {
          itemName: {
            type: "string",
            description: "The food item name requested by the user.",
          },
          quantity: {
            type: "number",
            description: "Quantity of the food item ordered (default 1).",
          },
          phoneNumber: {
            type: "string",
            description: "Customer's contact phone number.",
          },
          address: {
            type: "string",
            description: "Full, detailed delivery address provided explicitly by the user.",
          },
        },
        required: ["itemName", "quantity", "phoneNumber", "address"],
      },
    },
  },
];

export const toolHandlers = {
  confirmFoodOrder: async (args: OrderInput) => {
    try {
      // 🛑 ১. ফোন নম্বর ভ্যালিডেশন (BD Phone Regex: 013-019 দিয়ে শুরু ১১ ডিজিট)
      const cleanPhone = args.phoneNumber ? args.phoneNumber.replace(/[-_ ]/g, "") : "";
      const bdPhoneRegex = /^01[3-9]\d{8}$/;

      if (!cleanPhone || !bdPhoneRegex.test(cleanPhone)) {
        return "Apnar delivery address-ti peyechi! 📍 Order-ti confirm korar jonno apnar 11-digit-er valid contact phone number-ta (e.g. 017xxxxxxxx) kindly ektu diben?";
      }

      // 🛑 ২. ঠিকানা ভ্যালিডেশন
      const isGenericAddress =
        !args.address ||
        args.address.trim().length < 4 ||
        args.address.toLowerCase() === "dhaka" ||
        args.address.toLowerCase().includes("not provided");

      if (isGenericAddress) {
        return "Apnar phone number-ti peyechi! 📱 Order-ti complete korte apnar full delivery address-ta (House/Road/Area) kindly ektu bolben?";
      }

      // ৩. খাবার আছে কিনা চেক
      const meal = await prisma.meals.findFirst({
        where: {
          name: {
            contains: args.itemName,
            mode: "insensitive",
          },
          isDeleted: false,
          status: "AVAILABLE",
        },
      });

      if (!meal) {
        return `Dukhito! "${args.itemName}" নামে কোনো খাবার বর্তমানে পাওয়া যাচ্ছে না।`;
      }

      // ৪. ইউজার চেক/ক্রিয়েট
      let user = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });

      if (!user) {
        const uniqueId = `guest_${Date.now()}`;
        user = await prisma.user.create({
          data: {
            id: uniqueId,
            name: "Guest Customer",
            email: `${uniqueId}@b.com`,
            phone: cleanPhone,
          },
        });
      }

      const unitPrice = Number(meal.price);
      const totalAmount = unitPrice * args.quantity;

      // ৫. অর্ডার ক্রিয়েট
      const newOrder = await prisma.orders.create({
        data: {
          userId: user.id,
          providerId: meal.providerId,
          totalPrice: totalAmount,
          address: args.address,
          contactNumber: cleanPhone,
          status: "PLACED",
          paymentMethod: "COD",
          paymentStatus: "UNPAID",
          orderItems: {
            create: [
              {
                mealsId: meal.id,
                price: meal.price,
                quantity: args.quantity,
              },
            ],
          },
        },
      });

      return `Apnar order-ti successfully confirm hoye geche! 🎉\n\n📦 **Order Summary:**\n- **Item:** ${meal.name}\n- **Quantity:** ${args.quantity}\n- **Phone:** ${cleanPhone}\n- **Address:** ${args.address}\n- **Total Bill:** ${totalAmount} BDT\n- **Order ID:** #${newOrder.id}\n\nAmader delivery agent khub shighro apnar sathe jogajog korbe! Thank you! 😊`;
    } catch (error) {
      console.error("Database Order Creation Error:", error);
      return "Dukhito, system-e somossa hobar karone order-ti complete kora jacche na.";
    }
  },
};