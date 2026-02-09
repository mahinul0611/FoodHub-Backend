import { OrdersStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createReview = async (userId: string, payload: any) => {
    



  if (payload.ratings < 1 || payload.ratings > 5) {
    throw new Error("Rating must be between 1 and 5");
  }


  const hasOrdered = await prisma.orders.findFirst({
    where: {
      userId: userId,
      status: OrdersStatus.DELIVERED,
      orderItems: { some: { mealsId: payload.mealsId } },
    },
    include:{
        orderItems:true
    }
  });



  if (!hasOrdered) {
    throw new Error(
      "You have not ordered this food or The food is not delivered yet!!",
    );
  }


         const alreadyReviewed = await prisma.reviews.findFirst({
  where: {
    userId: userId,
    mealsId: payload.mealsId,
  },
});

        if (alreadyReviewed) {
  throw new Error("You have already reviewed this food")
}


  const result = await prisma.reviews.create({
    data: {
      ratings: Number(payload.ratings),
      comment: payload.comment,
      userId: userId,
      mealsId: payload.mealsId,
    },
  });

  return result;
};

export const reviewService = {
  createReview,
};
