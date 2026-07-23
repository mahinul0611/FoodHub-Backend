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
            providerId: provider.id 
          },
        },
      },
    },
    include: {
      orderItems: {
        where: {
          meals: { 
            providerId: provider.id 
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
      createdAt: "desc"
    }
  });
  return result;
};


const updateOrderStatus = async(orderId:string,status: OrdersStatus)=>{

  const result = await prisma.orders.update({
    where:{
      id:orderId
    },
    data: {
      status: status as OrdersStatus
    }
  })

  return result
}


const updateProfile = async (userId: string, payload: any) => {

  console.log("🔥 Frontend theke asha Payload:", payload);
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

export const providerService = {
  getAllProvider,
  getProviderOrder,
  updateOrderStatus,
  updateProfile,
};
