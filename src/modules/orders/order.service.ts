import { prisma } from "../../lib/prisma";

import { couponService, DELIVERY_CHARGE } from "../coupon/coupon.service";


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

      // Coupon + delivery charge
      let discount = 0;
      let appliedCode: string | null = null;
      if (data.couponCode) {
        const couponResult = await couponService.validateCoupon(
          data.couponCode,
          total,
        );
        discount = couponResult.discount;
        appliedCode = couponResult.code;
      }
      const totalPrice = Math.max(0, total + DELIVERY_CHARGE - discount);

      const order = await tx.orders.create({
        data: {
          userId,
          address: data.address,
          contactNumber: data.contactNumber,
          totalPrice,
          deliveryCharge: DELIVERY_CHARGE,
          discount,
          couponCode: appliedCode,
          status: "PLACED",
          providerId: meals[0]!.providerId,
          orderItems: {
            create: orderItems,
          },
        },
      });

      if (appliedCode) {
        await tx.coupon.update({
          where: { code: appliedCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
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

const cancelMyOrder = async (userId: string, orderId: string) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found!");
  if (order.userId !== userId)
    throw new Error("You can only cancel your own orders!");
  if (order.status !== "PLACED")
    throw new Error(
      "This order is already being prepared and can no longer be cancelled!",
    );

  return await prisma.orders.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      // Paid order hole paymentStatus PAID e thakbe (refund manually handle hobe)
      ...(order.paymentStatus === "PAID"
        ? {}
        : { paymentStatus: "CANCELLED" }),
    },
  });
};


export const orderService = {
  createOrder,
  getMyOrders,
  cancelMyOrder
};
