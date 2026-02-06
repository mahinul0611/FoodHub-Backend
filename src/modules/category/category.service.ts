import { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string }) => {
  return await prisma.category.create({
    data: {
      name: payload.name,
    },
  });
};


const updateCategory = async (categoryId:string, data:Partial<Category>)=>{



   const categoryData = await prisma.category.findUniqueOrThrow({
    where:{
      id:categoryId
    }
  })

  if(!categoryData){
    throw new Error("No category Found!");
  }


  const result = await prisma.category.update({
    where:{
      id:categoryId
    },
    data
  })

return result


}


const getAllCategory= async ()=>{


  const result = await prisma.category.findMany();

  return result
}


const getCategoryById = async (categoryId:string)=>{


 


  const result = await prisma.category.findUniqueOrThrow({
    where:{
      id:categoryId
    },
    include:{
      meals:true
    }
  })

return result


}



export const categoryService = {
  createCategory,
  updateCategory,
  getAllCategory,
  getCategoryById
};
