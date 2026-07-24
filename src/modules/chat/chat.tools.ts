import Groq from "groq-sdk";
import { prisma } from "../../lib/prisma";
import { OrderInput } from "./chat.types";

export const chatTools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "confirmFoodOrder",
      description:
        "Creates and confirms a food order in the database when the user provides item name, quantity, contact phone number, AND full delivery address.",
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
            description: "Full delivery address provided by the customer.",
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
      // ১. ডাটাবেজ থেকে এভেইলএবল খাবারটি বের করা
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

      // ২. ফোন নম্বর দিয়ে ইউজার চেক করা (না থাকলে Guest User তৈরি)
      let user = await prisma.user.findFirst({
        where: { phone: args.phoneNumber },
      });

      if (!user) {
        const uniqueId = `guest_${Date.now()}`;
        user = await prisma.user.create({
          data: {
            id: uniqueId,
            name: "Guest Customer",
            email: `${uniqueId}@foodhub.com`,
            phone: args.phoneNumber,
          },
        });
      }

      // ৩. মোট প্রাইস হিসাব
      const unitPrice = Number(meal.price);
      const totalAmount = unitPrice * args.quantity;

      // ৪. Schema অনুযায়ী exact field name দিয়ে Orders & OrderItems তৈরি
      const newOrder = await prisma.orders.create({
        data: {
          userId: user.id,
          providerId: meal.providerId,
          totalPrice: totalAmount,
          address: args.address, // 👈 schema.prisma-র address
          contactNumber: args.phoneNumber, // 👈 schema.prisma-র contactNumber
          status: "PLACED", // 👈 OrdersStatus Enum
          paymentMethod: "COD", // 👈 PaymentMethod Enum
          paymentStatus: "UNPAID", // 👈 PaymentStatus Enum
          orderItems: {
            // 👈 OrderItems টেবিলে রিলেশন
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

      return `Apanar order-ti successfully confirm hoye geche! 🎉\n\n📦 **Order Summary:**\n- **Item:** ${meal.name}\n- **Quantity:** ${args.quantity}\n- **Phone:** ${args.phoneNumber}\n- **Address:** ${args.address}\n- **Total Bill:** ${totalAmount} BDT\n- **Order ID:** #${newOrder.id}\n\nAmader delivery agent khub shighro apnar sathe jogajog korbe! Thank you! 😊`;
    } catch (error) {
      console.error("Database Order Creation Error:", error);
      return "Dukhito, system-e somossa hobar karone order-ti complete kora jacche na.";
    }
  },
};
