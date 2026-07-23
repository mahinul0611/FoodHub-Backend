import { Orders, OrdersStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllProvider = async () => {
  const result = await prisma.providersProfile.findMany();

  return result;
};

const getProviderOrder = async (providerId: string) => {
  const provider = await prisma.providersProfile.findUniqueOrThrow({
    where: { id: providerId },
  });

  const result = await prisma.orders.findMany({
    where: {
      orderItems: {
        some: {
          meals: {
            providerId: provider.id,
          },
        },
      },
    },
    include: {
      orderItems: {
        where: {
          meals: {
            providerId: provider.id,
          },
        },
        include: {
          meals: true,
        },
      },
      user: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const updateOrderStatus = async (orderId: string, status: OrdersStatus) => {
  const result = await prisma.orders.update({
    where: {
      id: orderId,
    },
    data: {
      status: status as OrdersStatus,
    },
  });

  return result;
};

const updateProfile = async (userId: string, payload: any) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new Error("User not found!");
  }

  // Transaction er madhyome 2to table eksathe update
  return await prisma.$transaction(async (tx) => {
    // 1. Restaurant/Provider Profile update
    const result = await tx.providersProfile.update({
      where: { userId: userId },
      data: payload, // payload e thaka sob update hobe
    });

    // 2. Sathe User table o update (jodi payload e name theke thake) jate profile e mismatch na hoy
    if (payload.name) {
      await tx.user.update({
        where: { id: userId },
        data: { name: payload.name },
      });
    }

    return result;
  });
};

const getAnalytics = async (userId: string) => {
  const provider = await prisma.providersProfile.findUniqueOrThrow({
    where: { userId },
  });

  const orders = await prisma.orders.findMany({
    where: {
      providerId: provider.id,
      status: { not: "CANCELLED" },
    },
    include: {
      orderItems: {
        include: { meals: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const revenueMap = new Map<string, number>();
  const mealSalesMap = new Map<string, { name: string; count: number }>();

  let totalRevenue = 0;
  let totalOrders = orders.length;

  orders.forEach((order) => {
    // Prisma Decimal ke Number-e convert kora holo
    const orderPrice = Number(order.totalPrice);
    totalRevenue += orderPrice;

    const date = order.createdAt.toISOString().split("T")[0] as string;
    revenueMap.set(date, (revenueMap.get(date) || 0) + orderPrice);

    order.orderItems.forEach((item) => {
      const mealId = item.mealsId;
      const mealName = item.meals?.name || "Unknown Meal";
      const current = mealSalesMap.get(mealId) || { name: mealName, count: 0 };
      current.count += item.quantity;
      mealSalesMap.set(mealId, current);
    });
  });

  const revenueData = Array.from(revenueMap.entries()).map(
    ([date, revenue]) => ({
      date,
      revenue,
    }),
  );

  const topMealsData = Array.from(mealSalesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders,
    revenueData,
    topMealsData,
  };
};

const getNearbyRestaurants = async (
  userLat: number,
  userLng: number,
  maxDistance: number = 10,
) => {
  // Haversine formula query using Prisma raw query
  const result = await prisma.$queryRaw`
      SELECT id, userId, name, email, latitude, longitude,
      ( 6371 * acos( cos( radians(${userLat}) ) * cos( radians( latitude ) ) 
      * cos( radians( longitude ) - radians(${userLng}) ) + sin( radians(${userLat}) ) 
      * sin( radians( latitude ) ) ) ) AS distance
      FROM "ProvidersProfile"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING ( 6371 * acos( cos( radians(${userLat}) ) * cos( radians( latitude ) ) 
      * cos( radians( longitude ) - radians(${userLng}) ) + sin( radians(${userLat}) ) 
      * sin( radians( latitude ) ) ) ) <= ${maxDistance}
      ORDER BY distance ASC;
    `;
  return result;
};

export const providerService = {
  getAllProvider,
  getProviderOrder,
  updateOrderStatus,
  updateProfile,
  getAnalytics,
  getNearbyRestaurants,
};
