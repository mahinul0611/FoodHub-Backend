import { Request, Response } from "express"
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const getUserInfo= async (req:Request,res:Response)=>{

    
    try {
     const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (session) {
  const fullUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      providersProfile: true, // যদি প্রোভাইডার হয় তবে তার প্রোফাইলসহ আসবে
      _count: {
        select: { orders: true } // কতগুলো অর্ডার করেছে তার সংখ্যা
      }
    }
  });
  return res.json(fullUser);
}


    } catch (error) {
        res.status(400).json({
            success:false,
            message:"User info fetching failed"
        })
    }


}



export const customerController= {
    getUserInfo
}