import { Meals } from "../../../generated/prisma/client"
import { MealsWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"

const createMeal = async (  payload :{
    name: string
    categoryId :string
    providerId: string
    description :string
    price: number
    quantity: number
    isOnDiet: boolean
}
)=>{

    
    const result = await prisma.meals.create({
        data: {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    quantity: payload.quantity,
    categoryId: payload.categoryId,
    providerId: payload.providerId,
    isOnDiet: payload.isOnDiet || false, 
  },
        
    });
    return result


}


const getAllMeals = async (query: any) => {
  const { searchTerm, minPrice, maxPrice, categoryId, ...filterData } = query;
  
  const andConditions: MealsWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId: { equals: categoryId } });
  }

  if (minPrice || maxPrice) {
  andConditions.push({
    price: {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    },
  });
}

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereConditions: MealsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.meals.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc", 
    },
    include: {
      category: true, 
      provider: true  
    },
  });

  const total = await prisma.meals.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const mealsService= {
    createMeal,
    getAllMeals
}

