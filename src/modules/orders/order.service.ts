import { prisma } from "../../lib/prisma";
import { couponService, DELIVERY_CHARGE } from "../coupon/coupon.service";
import { emailService } from "../email/email.service"; // 👈 ইমেইল সার্ভিস ইমপোর্ট করা হলো

const createOrder = async (userId: string, data: any) => {
  const order = await prisma.$transaction(
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

      // Coupon + Delivery charge calculation
      let discount = 0;
      let appliedCode: string | null = null;
      if (data.couponCode) {
        const couponResult = await couponService.validateCoupon(
          data.couponCode,
          total
        );
        discount = couponResult.discount;
        appliedCode = couponResult.code;
      }

      const totalPrice = Math.max(0, total + DELIVERY_CHARGE - discount);

      const createdOrder = await tx.orders.create({
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

      // Coupon use korle count +1 kora
      if (appliedCode) {
        await tx.coupon.update({
          where: { code: appliedCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    },
    {
      timeout: 20000,
    }
  );

  // 🚀 ট্রানজেকশন শেষ হওয়ার পর ব্যাকগ্রাউন্ডে অর্ডার কনফার্মেশন মেইল পাঠানো
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      emailService
        .sendOrderConfirmation(
          user.email,
          user.name || "Customer",
          order.id,
          Number(order.totalPrice)
        )
        .catch((err) => console.error("Background Order Email Error:", err));
    }
  } catch (emailErr) {
    console.error("Failed to trigger order confirmation email:", emailErr);
  }

  return order;
};

const getMyOrders = async (userId: string) => {
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
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

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
      ...(order.paymentStatus === "PAID"
        ? {}
        : { paymentStatus: "CANCELLED" }),
    },
  });
};

// 🆕 অর্ডার স্ট্যাটাস আপডেট করার সার্ভিস (যেমন DELIVERED হলে মেইল যাবে)
// orderService এর ভিতরে updateOrderStatus ফাংশনটি এভাবে ঠিক করুন:
const updateOrderStatus = async (orderId: string, status: any) => { // 👈 status-কে any বা প্রিজমা এনুম টাইপ দিন
  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: { status }, // এখানে টাইপ এরর দিবে না
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  if (updatedOrder?.user?.email) {
    emailService
      .sendOrderStatus(
        updatedOrder.user.email,
        updatedOrder.user.name || "Customer",
        updatedOrder.id,
        updatedOrder.status
      )
      .catch((err) => console.error("Background Status Email Error:", err));
  }

  return updatedOrder;
};

export const orderService = {
  createOrder,
  getMyOrders,
  cancelMyOrder,
  updateOrderStatus, // 👈 এক্সপোর্ট করা হলো
};