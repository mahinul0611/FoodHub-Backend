// src/modules/orders/order.service.ts
import { prisma } from "../../lib/prisma";
import { OrdersStatus } from "../../../generated/prisma/enums";

export const createOrder = async (
  userId: string, 
  orderData: {
    address: string;
    contactNumber: string;
    items: any[];
  }
) => {
  const { address, contactNumber, items } = orderData;

  // ১. টোটাল প্রাইজ ক্যালকুলেট করা
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const newOrder = await prisma.$transaction(async (tx) => {
    // ২. অর্ডার টেবিল তৈরি
    const order = await tx.orders.create({
      data: {
        userId,
        totalPrice,
        address,
        contactNumber,
        status: OrdersStatus.PLACED,
        orderItems: {
          create: items.map((item: any) => ({
            mealsId: item.mealsId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // ৩. স্টক আপডেট (Decrement Stock)
    for (const item of items) {
      await tx.meals.update({
        where: { id: item.mealsId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    return order;
  });

  return newOrder;
};