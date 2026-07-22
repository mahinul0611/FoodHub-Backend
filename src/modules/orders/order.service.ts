import { prisma } from "../../lib/prisma";

const createOrder = async (userId: string, data: any) => {


// Phone verification requirement — re-enable when needed

//   const orderingUser = await prisma.user.findUniqueOrThrow({
//   where: { id: userId },
// });

// if (!orderingUser.phoneVerified) {
//   throw new Error(
//     "Please verify your phone number before placing an order!",
//   );
// }
  return await prisma.$transaction(
    async (tx) => {
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
    },
    {
      timeout: 20000,
    },
  );
};


const getMyOrders= async (userId:string)=>{


  const result = await prisma.orders.findMany({
   where: {
      userId: userId, 
    },
    include: {
      orderItems: {
        include: {
          meals: {
            select: {
              name: true,
              price: true,
              description: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })


  return result

}


export const orderService = {
  createOrder,
  getMyOrders
};
