import { UserStatus } from "../../../generated/prisma/enums";
import { UserRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateUserStatus = async (userId: string, status: string) => {


  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("No user found with this ID");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      status: status as any,
    },
  });

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

export const adminService = {
  getAllUsers,
  getUserById,
  getAdminStats,
  updateUserStatus,
};
