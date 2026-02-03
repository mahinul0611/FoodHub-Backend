import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth"; // আপনার Better Auth কনফিগ ফাইল

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized: Please login first" });
  }

  // রিকোয়েস্ট অবজেক্টে ইউজার এবং সেশন ডেটা পাস করা
  // @ts-ignore (TypeScript error এড়াতে)
  req.user = session.user;
  // @ts-ignore
  req.session = session.session;

  next();
};

// রোল চেক করার জন্য (যেমন: শুধু প্রোভাইডার বা এডমিন)
export const authorizeRole = (role: "ADMIN" | "PROVIDER" | "CUSTOMER") => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user?.role !== role) {
      return res.status(403).json({ message: `Access denied: ${role} only` });
    }
    next();
  };
};