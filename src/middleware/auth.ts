import { NextFunction, Request, Response } from "express";
import { UserRole } from "../lib/auth";

import { auth as betterAuth } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        emailVerified: boolean;
      };
    }
  }
}
const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(3).json({
          succes: false,
          message: "Please verify your email",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(3).json({
          succes: false,
          message: "Forbidden!! You don't have access ",
        });
      }

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  };
};

export default auth;
