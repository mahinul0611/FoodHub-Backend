import { prisma } from "../../lib/prisma"

const getUserInfo= async (userId:string )=>{

    const result = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    return result


}



export const customerServcie= {
    getUserInfo
}