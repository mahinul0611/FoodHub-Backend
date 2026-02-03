import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string }) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategory= async ()=>{


  const result = await prisma.category.findMany();

  return result
}



export const categoryService = {
  createCategory,
  getAllCategory
};
