import { prisma } from "../../lib/prisma"; // আপনার প্রিজমা ক্লায়েন্ট পাথ চেক করুন

const updateProfile = async (userId: string, payload: any) => {
  // ১. আগে চেক করি ইউজার আদৌ আছে কি না
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new Error("User not found!");
  }

  // ২. প্রোফাইল আপডেট (ProvidersProfile টেবিলে)
  const result = await prisma.providersProfile.update({
    where: {
      userId: userId, // আমরা userId দিয়ে প্রোফাইল খুঁজছি (কারণ ওয়ান-টু-ওয়ান রিলেশন)
    },
    data: payload,
  });

  return result;
};

export const providerService = {
  updateProfile,
};