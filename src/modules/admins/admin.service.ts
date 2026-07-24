import { UserStatus } from "../../../generated/prisma/enums";
import { UserRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone:true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      status: status as UserStatus,
    },
  });

  if (status === "SUSPEND") {
    await prisma.session.deleteMany({
      where: { userId: userId },
    });
  }

  return result;
};

const getUserById = async (userId: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  return result;
};

const getAdminStats = async () => {
  const [
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.USER } }),
    prisma.user.count({ where: { role: UserRole.PROVIDER } }),
    prisma.orders.count(),
    prisma.orders.count({
      where: { status: "DELIVERED" },
    }),

    prisma.orders.count({
      where: { status: "CANCELLED" },
    }),
    prisma.orders.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true },
    }),
  ]);

  return {
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    revenue: totalRevenue._sum.totalPrice || 0,
  };
};

const getAllOrders = async () => {
  const [
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.USER } }),
    prisma.user.count({ where: { role: UserRole.PROVIDER } }),
    prisma.orders.count(),
    prisma.orders.count({
      where: { status: "DELIVERED" },
    }),

    prisma.orders.count({
      where: { status: "CANCELLED" },
    }),
    prisma.orders.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true },
    }),
  ]);

  const result = await prisma.orders.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          meals: { select: { name: true, price: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    result,
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    revenue: totalRevenue._sum.totalPrice || 0,
  };
};


const removeProvider = async (providerId: string) => {
  const provider = await prisma.providersProfile.findUnique({
    where: { userId: providerId },
  });

  if (!provider) {
    throw new Error("Provider profile not found!");
  }

  await prisma.$transaction(async (tx) => {
    // 1. User table e hide kora
    await tx.user.update({
      where: { id: providerId },
      data: { isDeleted: true },
    });

    // 2. Provider table e hide kora
    await tx.providersProfile.update({
      where: { id: provider.id },
      data: { isDeleted: true },
    });

    // 3. Oi provider er shob Meals eksathe hide kora
    await tx.meals.updateMany({
      where: { providerId: provider.id },
      data: { isDeleted: true },
    });
  });

  return { message: "Provider and associated meals successfully removed." };
};



const getLoginSessions = async () => {
  // Session table theke latest 50 ta login history fetch kora hocche
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true, // Tomar User table-e jodi role field thake
        },
      },
    },
    orderBy: {
      createdAt: "desc", // BetterAuth-e createdAt na thakle 'expiresAt' use korbe
    },
    take: 50, // Limit kore dilam jate query fast hoy
  });

  return sessions;
};


export const adminService = {
  getAllUsers,
  getAllOrders,
  getUserById,
  getAdminStats,
  updateUserStatus,
  removeProvider,
  getLoginSessions,
};
