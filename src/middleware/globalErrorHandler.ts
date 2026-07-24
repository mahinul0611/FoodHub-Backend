import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { ZodError } from "zod";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  // For ZodError:
  if (err instanceof ZodError) {
    statusCode = 400;
    // 👈 এখানে পাথ বাদ দিয়ে শুধুমাত্র মূল মেসেজটি নেওয়া হচ্ছে
    errorMessage = err.issues[0]?.message || "Validation Error";
  }

  // For PrismaClientValidationError:
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Missing field or Incorrect field type";
  }

  // For PrismaClientKnownRequestError :
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage =
        "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key Error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed on the field";
    }
  }

  // For PrismaClientUnknownRequestError :
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "An error occured during query execution ";
  }

  // For PrismaClientInitializationError:
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication Failed Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Cannot reach database server";
    }
  }

  res.status(statusCode);
  res.json({
    message: errorMessage,
  });
}

export default errorHandler;