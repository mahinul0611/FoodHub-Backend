import { prisma } from "../../lib/prisma"

const getUserInfo= async (userId:string )=>{

    const result = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    return result


}


const updateMyInfo = async (userId: string, payload: { name?: string; phone?: string; image?: string }) => {
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
  });

  return result;
};


export const meServcie= {
    getUserInfo,
    updateMyInfo
}