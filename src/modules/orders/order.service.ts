import { prisma } from "../../lib/prisma";

// order.service.ts
 const createOrder = async (userId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    const mealIds = data.items.map((i: any) => i.mealsId);

    const meals = await tx.meals.findMany({
      where: { id: { in: mealIds } },
    });

    if (meals.length !== data.items.length) {
      throw new Error("One or more meals not found");
    }

    let total = 0;
    const orderItems = data.items.map((item: any) => {
      const meal = meals.find((m) => m.id === item.mealsId);
      const price = Number(meal?.price || 0);
      total += price * item.quantity;
      
      return {
        mealsId: item.mealsId,
        quantity: item.quantity,
        price: price, 
      };
    });

    // Main Order Create
    return await tx.orders.create({
      data: {
        userId,
        address: data.address,
        contactNumber: data.contactNumber,
        totalPrice: total,
        status: "PLACED",
        providerId: meals[0]!.providerId, 
        orderItems: {
          create: orderItems,
        },
      },
    });
  }, {
    timeout: 20000, 
  });
};

export const orderService = {
  createOrder
}