var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express8 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums : \nenum MealsStatus {\n  AVAILABLE\n  STOCKOUT\n}\n\nenum OrdersStatus {\n  PLACED\n  PREPARING\n  READY\n  DELIVERED\n  CANCELLED\n}\n\nenum Role {\n  ADMIN\n  USER\n  PROVIDER\n}\n\nenum UserStatus {\n  ACTIVATE\n  SUSPEND\n}\n\nmodel Meals {\n  id          String           @id @default(uuid())\n  name        String           @db.VarChar(225)\n  categoryId  String\n  category    Category         @relation(fields: [categoryId], references: [id])\n  providerId  String\n  provider    ProvidersProfile @relation(fields: [providerId], references: [id])\n  price       Decimal\n  quantity    Int\n  description String\n  status      MealsStatus      @default(AVAILABLE)\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n  isOnDiet    Boolean\n  reviews     Reviews[]\n  orderItems  OrderItems[]\n}\n\nmodel Category {\n  id        String   @id @default(uuid())\n  name      String   @unique @db.VarChar(225)\n  meals     Meals[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Orders {\n  id            String            @id @default(uuid())\n  userId        String\n  user          User              @relation(fields: [userId], references: [id])\n  providerId    String?\n  provider      ProvidersProfile? @relation(fields: [providerId], references: [id])\n  totalPrice    Decimal // Stored in cents (e.g., 1000 for $10.00)\n  address       String\n  contactNumber String            @db.VarChar(30)\n  status        OrdersStatus      @default(PLACED) // Ensure you have a default\n  createdAt     DateTime          @default(now())\n  updatedAt     DateTime          @updatedAt\n  orderItems    OrderItems[]\n\n  @@index([status])\n  @@index([userId]) // Added index for customer order history lookup\n}\n\nmodel OrderItems {\n  id        String   @id @default(uuid())\n  price     Decimal // Price at the time of purchase\n  quantity  Int\n  mealsId   String\n  meals     Meals    @relation(fields: [mealsId], references: [id])\n  orderId   String\n  order     Orders   @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Reviews {\n  id        String   @id @default(uuid())\n  ratings   Int\n  userId    String\n  mealsId   String\n  comment   String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  meals     Meals    @relation(fields: [mealsId], references: [id])\n  user      User     @relation(fields: [userId], references: [id])\n\n  @@index([ratings])\n  @@map("reviews")\n}\n\nmodel ProvidersProfile {\n  id        String   @id @default(uuid())\n  userId    String   @unique\n  user      User     @relation(fields: [userId], references: [id])\n  name      String\n  email     String\n  meals     Meals[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  orders    Orders[]\n}\n\nmodel User {\n  id               String            @id\n  name             String\n  email            String            @unique\n  emailVerified    Boolean           @default(false)\n  providersProfile ProvidersProfile?\n  image            String?\n  createdAt        DateTime          @default(now())\n  updatedAt        DateTime          @updatedAt\n  role             Role              @default(USER)\n  phone            String?\n  status           UserStatus        @default(ACTIVATE)\n  accounts         Account[]\n  sessions         Session[]\n  orders           Orders[]\n  reviews          Reviews[]\n\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Meals":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeals"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProvidersProfile","relationName":"MealsToProvidersProfile"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"description","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"MealsStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"isOnDiet","kind":"scalar","type":"Boolean"},{"name":"reviews","kind":"object","type":"Reviews","relationName":"MealsToReviews"},{"name":"orderItems","kind":"object","type":"OrderItems","relationName":"MealsToOrderItems"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meals","relationName":"CategoryToMeals"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Orders":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrdersToUser"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProvidersProfile","relationName":"OrdersToProvidersProfile"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"address","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrdersStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItems","relationName":"OrderItemsToOrders"}],"dbName":null},"OrderItems":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"mealsId","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meals","relationName":"MealsToOrderItems"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Orders","relationName":"OrderItemsToOrders"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Reviews":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"ratings","kind":"scalar","type":"Int"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mealsId","kind":"scalar","type":"String"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"meals","kind":"object","type":"Meals","relationName":"MealsToReviews"},{"name":"user","kind":"object","type":"User","relationName":"ReviewsToUser"}],"dbName":"reviews"},"ProvidersProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ProvidersProfileToUser"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meals","relationName":"MealsToProvidersProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orders","kind":"object","type":"Orders","relationName":"OrdersToProvidersProfile"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"providersProfile","kind":"object","type":"ProvidersProfile","relationName":"ProvidersProfileToUser"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"orders","kind":"object","type":"Orders","relationName":"OrdersToUser"},{"name":"reviews","kind":"object","type":"Reviews","relationName":"ReviewsToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MealsScalarFieldEnum: () => MealsScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemsScalarFieldEnum: () => OrderItemsScalarFieldEnum,
  OrdersScalarFieldEnum: () => OrdersScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  ProvidersProfileScalarFieldEnum: () => ProvidersProfileScalarFieldEnum,
  QueryMode: () => QueryMode,
  ReviewsScalarFieldEnum: () => ReviewsScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Meals: "Meals",
  Category: "Category",
  Orders: "Orders",
  OrderItems: "OrderItems",
  Reviews: "Reviews",
  ProvidersProfile: "ProvidersProfile",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var MealsScalarFieldEnum = {
  id: "id",
  name: "name",
  categoryId: "categoryId",
  providerId: "providerId",
  price: "price",
  quantity: "quantity",
  description: "description",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  isOnDiet: "isOnDiet"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrdersScalarFieldEnum = {
  id: "id",
  userId: "userId",
  providerId: "providerId",
  totalPrice: "totalPrice",
  address: "address",
  contactNumber: "contactNumber",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderItemsScalarFieldEnum = {
  id: "id",
  price: "price",
  quantity: "quantity",
  mealsId: "mealsId",
  orderId: "orderId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewsScalarFieldEnum = {
  id: "id",
  ratings: "ratings",
  userId: "userId",
  mealsId: "mealsId",
  comment: "comment",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ProvidersProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  name: "name",
  email: "email",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  phone: "phone",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var OrdersStatus = {
  PLACED: "PLACED",
  PREPARING: "PREPARING",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false
      },
      phone: {
        type: "string",
        required: true
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.role === "ADMIN") {
            throw new Error("Admin creation is not allowed!!!");
          }
          return {
            data: user
          };
        },
        after: async (data) => {
          try {
            const user = data;
            const userRole = user.role;
            if (userRole === "PROVIDER") {
              console.log("Creating profile for:", user.email);
              await prisma.providersProfile.create({
                data: {
                  userId: user.id,
                  name: user.name || "New Provider",
                  email: user.email
                }
              });
              console.log("\u2705 Profile created successfully!");
            }
          } catch (error) {
            console.error("\u274C ERROR Creating Profile:", error);
          }
        }
      }
    }
  },
  trustedOrigins: [process.env.APP_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    freshAge: 0
  },
  advanced: {
    useSecureCookies: false
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"FoodHub" <foodhub@food.com>',
          to: user.email,
          subject: "Email Verification",
          // text: "Verify your email", // Plain-text version of the message
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #ff4757; padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; line-height: 1.6; color: #333333; }
    .button-container { text-align: center; margin-top: 30px; }
    .verify-button { background-color: #ff4757; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FoodHub</h1>
    </div>
    <div class="content">
      <h2>Welcome to FoodHub!</h2>
      <p>Hello,${user.name}</p>
      <p>Thank you for signing up for FoodHub. We're excited to have you join our food delivery community! To get started, please verify your email address by clicking the button below.</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
      </div>

      <p style="margin-top: 30px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #ff4757; font-size: 13px;">${verificationUrl}</p>
      
      <p>This link will expire in 24 hours. If you did not create an account, no further action is required.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 FoodHub Delivery Service. All rights reserved.</p>
      <p>Dhaka, Bangladesh</p>
    </div>
  </div>
</body>
</html>`
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error("Verification email sent fail");
      }
    }
  }
});

// src/app.ts
import cors from "cors";

// src/modules/meals/meals.route.ts
import express from "express";

// src/modules/meals/meals.service.ts
var createMeal = async (payload) => {
  const result = await prisma.meals.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      quantity: payload.quantity,
      categoryId: payload.categoryId,
      providerId: payload.providerId,
      isOnDiet: payload.isOnDiet || false
    }
  });
  return result;
};
var getAllMeals = async (query) => {
  const { searchTerm, minPrice, maxPrice, categoryId, ...filterData } = query;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ]
    });
  }
  if (categoryId) {
    andConditions.push({ categoryId: { equals: categoryId } });
  }
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        ...minPrice ? { gte: Number(minPrice) } : {},
        ...maxPrice ? { lte: Number(maxPrice) } : {}
      }
    });
  }
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: filterData[key] }
      }))
    });
  }
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.meals.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      category: true,
      provider: true,
      _count: {
        select: { reviews: true }
      },
      reviews: {
        select: {
          ratings: true
        }
      }
    }
  });
  const resultWithAverageRating = result.map((meal) => {
    const totalReviews = meal.reviews.length;
    const sumRatings = meal.reviews.reduce((acc, review) => acc + review.ratings, 0);
    const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : "0";
    return {
      ...meal,
      averageRating: parseFloat(averageRating),
      totalReviews: meal._count.reviews
    };
  });
  const total = await prisma.meals.count({ where: whereConditions });
  return {
    meta: {
      page,
      limit,
      total
    },
    data: resultWithAverageRating
  };
};
var getMealById = async (mealId) => {
  const result = await prisma.meals.findUniqueOrThrow({
    where: {
      id: mealId
    },
    include: {
      category: {
        select: {
          name: true
        }
      },
      provider: {
        select: {
          name: true,
          email: true
        }
      },
      reviews: true
    }
  });
  const reviewsCount = result?.reviews.length || 0;
  const averageRating = reviewsCount > 0 ? result?.reviews.reduce((acc, curr) => acc + curr.ratings, 0) / reviewsCount : 0;
  return { ...result, averageRating, reviewsCount };
};
var updateMeals = async (mealId, data, providerId, isProvider) => {
  const mealData = await prisma.meals.findUniqueOrThrow({
    where: {
      id: mealId
    },
    select: {
      id: true,
      providerId: true
    }
  });
  if (!isProvider && mealData.id !== providerId) {
    throw new Error("You are not the owner of this Meal!!! ");
  }
  const result = await prisma.meals.update({
    where: {
      id: mealId
    },
    data
  });
  return result;
};
var deleteMeal = async (mealId, providerId, isProvider) => {
  const mealData = await prisma.meals.findUniqueOrThrow({
    where: {
      id: mealId
    },
    select: {
      id: true,
      providerId: true
    }
  });
  if (!isProvider && mealData.providerId !== providerId) {
    throw new Error("You are not the owner of this post!!! ");
  }
  const result = await prisma.meals.delete({
    where: {
      id: mealId
    }
  });
  return result;
};
var mealsService = {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeals,
  deleteMeal
};

// src/modules/meals/meals.controller.ts
var createMeal2 = async (req, res) => {
  try {
    const result = await mealsService.createMeal(req.body);
    res.status(200).json({
      success: true,
      message: "Meals Created Successfully",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error
    });
  }
};
var getAllMeals2 = async (req, res) => {
  const result = await mealsService.getAllMeals(req.query);
  res.status(200).json({
    success: true,
    message: "Meals retrieved successfully",
    meta: result.meta,
    data: result.data
  });
};
var getMealById2 = async (req, res) => {
  try {
    const { mealId } = req.params;
    const result = await mealsService.getMealById(mealId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Not Found"
    });
  }
};
var updateMeals2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are not authorized");
    }
    const { mealId } = req.params;
    const isProvider = user.role === "PROVIDER" /* PROVIDER */;
    const result = await mealsService.updateMeals(
      mealId,
      req.body,
      user.id,
      isProvider
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Update Failed"
    });
  }
};
var deleteMeal2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are not authorized");
    }
    const { mealId } = req.params;
    const isProvider = user.role === "PROVIDER" /* PROVIDER */;
    const result = await mealsService.deleteMeal(
      mealId,
      user?.id,
      isProvider
    );
    res.status(200).json({
      success: true,
      message: "Meal Deleted Successfully",
      data: null
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Meals Deletion Failed"
    });
  }
};
var mealsController = {
  createMeal: createMeal2,
  getAllMeals: getAllMeals2,
  getMealById: getMealById2,
  updateMeals: updateMeals2,
  deleteMeal: deleteMeal2
};

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(3).json({
          succes: false,
          message: "Please verify your email"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(3).json({
          succes: false,
          message: "Forbidden!! You don't have access "
        });
      }
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Something went wrong!"
      });
    }
  };
};
var auth_default = auth2;

// src/modules/meals/meals.route.ts
var router = express.Router();
router.get("/", mealsController.getAllMeals);
router.post("/", auth_default("PROVIDER" /* PROVIDER */), mealsController.createMeal);
router.get("/:mealId", mealsController.getMealById);
router.put("/:mealId", auth_default("PROVIDER" /* PROVIDER */), mealsController.updateMeals);
router.delete("/:mealId", auth_default("PROVIDER" /* PROVIDER */), mealsController.deleteMeal);
var mealsRouter = router;

// src/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Missing field or Incorrect field type";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key Error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed on the field";
    }
  }
  if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "An error occured during query execution ";
  }
  if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
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
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route Not Found",
    path: req.originalUrl,
    date: Date()
  });
}

// src/modules/category/category.route.ts
import express2 from "express";

// src/modules/category/category.service.ts
var createCategory = async (payload) => {
  return await prisma.category.create({
    data: {
      name: payload.name
    }
  });
};
var updateCategory = async (categoryId, data) => {
  const categoryData = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId
    }
  });
  if (!categoryData) {
    throw new Error("No category Found!");
  }
  const result = await prisma.category.update({
    where: {
      id: categoryId
    },
    data
  });
  return result;
};
var getAllCategory = async () => {
  const result = await prisma.category.findMany();
  return result;
};
var getCategoryById = async (categoryId) => {
  const result = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId
    },
    include: {
      meals: true
    }
  });
  return result;
};
var categoryService = {
  createCategory,
  updateCategory,
  getAllCategory,
  getCategoryById
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN" /* ADMIN */) {
      return res.status(403).json({ success: false, message: "You are not authorized!" });
    }
    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Category Creation failed",
      error: error.message
    });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const user = req.user;
    console.log({ user });
    if (user?.role !== "ADMIN" /* ADMIN */) {
      throw new Error("Sorry! You are not allowed to update category!");
    }
    const { categoryId } = req.params;
    const result = await categoryService.updateCategory(
      categoryId,
      req.body
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getAllCategory2 = async (req, res) => {
  try {
    const result = await categoryService.getAllCategory();
    res.status(200).json({
      success: true,
      message: "All category fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error
    });
  }
};
var getCategoryById2 = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryById(categoryId);
    res.status(200).json({
      success: true,
      message: "Specific category Data fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Category Data fetching Failed",
      error: error.message
    });
  }
};
var categoryController = {
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  getAllCategory: getAllCategory2,
  getCategoryById: getCategoryById2
};

// src/modules/category/category.route.ts
var router2 = express2.Router();
router2.get(
  "/category",
  auth_default("ADMIN" /* ADMIN */),
  categoryController.getAllCategory
);
router2.get(
  "/category/:categoryId",
  categoryController.getCategoryById
);
router2.put(
  "/category/:categoryId",
  auth_default("ADMIN" /* ADMIN */),
  categoryController.updateCategory
);
router2.post(
  "/category",
  auth_default("ADMIN" /* ADMIN */),
  categoryController.createCategory
);
var categoryRouter = router2;

// src/modules/provider/provider.route.ts
import express3 from "express";

// src/modules/provider/provider.service.ts
var getAllProvider = async () => {
  const result = await prisma.providersProfile.findMany();
  return result;
};
var getProviderOrder = async (providerId) => {
  const provider = await prisma.providersProfile.findUniqueOrThrow({
    where: { id: providerId }
  });
  const result = await prisma.orders.findMany({
    where: {
      orderItems: {
        some: {
          meals: {
            providerId: provider.id
          }
        }
      }
    },
    include: {
      orderItems: {
        where: {
          meals: {
            providerId: provider.id
          }
        },
        include: {
          meals: true
        }
      },
      user: {
        select: {
          name: true,
          phone: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var updateOrderStatus = async (orderId, status) => {
  const result = await prisma.orders.update({
    where: {
      id: orderId
    },
    data: {
      status
    }
  });
  return result;
};
var updateProfile = async (userId, payload) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!isUserExist) {
    throw new Error("User not found!");
  }
  const result = await prisma.providersProfile.update({
    where: {
      userId
    },
    data: payload
  });
  return result;
};
var providerService = {
  getAllProvider,
  getProviderOrder,
  updateOrderStatus,
  updateProfile
};

// src/modules/provider/provider.controller.ts
var getAllProvider2 = async (req, res) => {
  try {
    const result = await providerService.getAllProvider();
    res.status(200).json({
      success: true,
      message: "Provider fetched Successfuly",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Provider Fetching failed"
    });
  }
};
var getProviderOrder2 = async (req, res) => {
  try {
    const providerId = req.user.id;
    const providerProfile = await prisma.providersProfile.findUnique({
      where: { userId: providerId }
    });
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found "
      });
    }
    const result = await providerService.getProviderOrder(providerProfile.id);
    res.status(200).json({
      success: true,
      message: "Provider orders fetched Successfuly",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Provider order Fetching failed"
    });
  }
};
var updateOrderStatus2 = async (req, res) => {
  try {
    const providerUserId = req.user?.id;
    const providerProfile = await prisma.providersProfile.findUniqueOrThrow({
      where: {
        userId: providerUserId
      }
    });
    if (!providerProfile) {
      return res.status(403).json({ success: false, message: "Provider Profile Not Found" });
    }
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { meals: true } } }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order Not Found" });
    }
    const isOwnOrder = order.orderItems.some(
      (item) => item.meals.providerId === providerProfile.id
    );
    if (!isOwnOrder) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This order contains items from another provider"
      });
    }
    const result = await providerService.updateOrderStatus(orderId, status);
    res.status(200).json({
      success: true,
      message: " Order Status updated Successfuly",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Order status Update failed"
    });
  }
};
var updateProfile2 = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const result = await providerService.updateProfile(id, updatedData);
  res.status(200).json({
    success: true,
    message: "Provider profile updated successfully",
    data: result
  });
};
var providerController = {
  getAllProvider: getAllProvider2,
  getProviderOrder: getProviderOrder2,
  updateOrderStatus: updateOrderStatus2,
  updateProfile: updateProfile2
};

// src/modules/provider/provider.route.ts
var router3 = express3.Router();
router3.get("/", providerController.getAllProvider);
router3.get("/orders", auth_default("PROVIDER" /* PROVIDER */), providerController.getProviderOrder);
router3.patch("/orders/:orderId", auth_default("PROVIDER" /* PROVIDER */), providerController.updateOrderStatus);
router3.patch("/profile/:id", auth_default("PROVIDER" /* PROVIDER */), providerController.updateProfile);
var providerRouter = router3;

// src/modules/orders/order.service.ts
var createOrder = async (userId, data) => {
  return await prisma.$transaction(
    async (tx) => {
      const mealIds = data.items.map((i) => i.mealsId);
      const meals = await tx.meals.findMany({
        where: { id: { in: mealIds } }
      });
      if (meals.length !== data.items.length) {
        throw new Error("One or more meals not found");
      }
      let total = 0;
      const orderItems = data.items.map((item) => {
        const meal = meals.find((m) => m.id === item.mealsId);
        const price = Number(meal?.price || 0);
        total += price * item.quantity;
        return {
          mealsId: item.mealsId,
          quantity: item.quantity,
          price
        };
      });
      return await tx.orders.create({
        data: {
          userId,
          address: data.address,
          contactNumber: data.contactNumber,
          totalPrice: total,
          status: "PLACED",
          providerId: meals[0].providerId,
          orderItems: {
            create: orderItems
          }
        }
      });
    },
    {
      timeout: 2e4
    }
  );
};
var getMyOrders = async (userId) => {
  const result = await prisma.orders.findMany({
    where: {
      userId
    },
    include: {
      orderItems: {
        include: {
          meals: {
            select: {
              name: true,
              price: true,
              description: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var orderService = {
  createOrder,
  getMyOrders
};

// src/modules/orders/order.controller.ts
var createOrder2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed!"
      });
    }
    const { address, contactNumber, items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }
    const order = await orderService.createOrder(userId, {
      address,
      contactNumber,
      items
    });
    return res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Order creation Failed",
      error: error.message
    });
  }
};
var getMyOrders2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await orderService.getMyOrders(user.id);
    res.status(201).json({
      success: true,
      message: "Customer Order fetched Successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Customer Order Fetching Failed",
      error: error.message
    });
  }
};
var orderController = {
  createOrder: createOrder2,
  getMyOrders: getMyOrders2
};

// src/modules/orders/order.route.ts
import express4 from "express";
var router4 = express4.Router();
router4.get("/test", (req, res) => res.send("Admin path working!"));
router4.get("/", auth_default("USER" /* USER */), orderController.getMyOrders);
router4.post("/", auth_default("USER" /* USER */), orderController.createOrder);
var orderRouter = router4;

// src/modules/admins/admin.route.ts
import express5 from "express";

// src/modules/admins/admin.service.ts
var getAllUsers = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("No user found with this ID");
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      status
    }
  });
  return result;
};
var getUserById = async (userId) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });
  return result;
};
var getAdminStats = async () => {
  const [
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    totalRevenue
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" /* USER */ } }),
    prisma.user.count({ where: { role: "PROVIDER" /* PROVIDER */ } }),
    prisma.orders.count(),
    prisma.orders.count({
      where: { status: "DELIVERED" }
    }),
    prisma.orders.count({
      where: { status: "CANCELLED" }
    }),
    prisma.orders.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true }
    })
  ]);
  return {
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    revenue: totalRevenue._sum.totalPrice || 0
  };
};
var getAllOrders = async () => {
  const [
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    totalRevenue
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" /* USER */ } }),
    prisma.user.count({ where: { role: "PROVIDER" /* PROVIDER */ } }),
    prisma.orders.count(),
    prisma.orders.count({
      where: { status: "DELIVERED" }
    }),
    prisma.orders.count({
      where: { status: "CANCELLED" }
    }),
    prisma.orders.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true }
    })
  ]);
  const result = await prisma.orders.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          meals: { select: { name: true, price: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return {
    result,
    totalCustomers,
    totalProviders,
    totalOrders,
    totalDelivered,
    totalCancelled,
    revenue: totalRevenue._sum.totalPrice || 0
  };
};
var adminService = {
  getAllUsers,
  getAllOrders,
  getUserById,
  getAdminStats,
  updateUserStatus
};

// src/modules/admins/admin.controller.ts
var getAllUsers2 = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN" /* ADMIN */) {
      throw new Error("Sorry You are unauthorized!");
    }
    const result = await adminService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "All User Data Fetched Successfully",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "All User Data Fetched Failed"
    });
  }
};
var getUserById2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.getUserById(userId);
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "User data fetching failed",
      error: error.message
    });
  }
};
var updateUserStatus2 = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN" /* ADMIN */) {
      throw new Error("Sorry You are unauthorized!");
    }
    const { userId } = req.params;
    const { status } = req.body;
    const result = await adminService.updateUserStatus(
      userId,
      status
    );
    res.status(200).json({
      success: true,
      message: "User Status Update Successfull",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: " User Status Update Failed"
    });
  }
};
var getAdminStats2 = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN" /* ADMIN */) {
      throw new Error("Sorry You are unauthorized!");
    }
    const result = await adminService.getAdminStats();
    res.status(200).json({
      success: true,
      message: "All data fetched Successfully",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "All  Data Fetching Failed"
    });
  }
};
var getAllOrders2 = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN" /* ADMIN */) {
      throw new Error("Unauthorized!");
    }
    const result = await adminService.getAllOrders();
    res.status(200).json({
      success: true,
      message: "Order List fetched Successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Order List not Found"
    });
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  getAllOrders: getAllOrders2,
  getUserById: getUserById2,
  getAdminStats: getAdminStats2,
  updateUserStatus: updateUserStatus2
};

// src/modules/admins/admin.route.ts
var router5 = express5.Router();
router5.get("/users", auth_default("ADMIN" /* ADMIN */), adminController.getAllUsers);
router5.get("/orders", auth_default("ADMIN" /* ADMIN */), adminController.getAllOrders);
router5.get("/stats", auth_default("ADMIN" /* ADMIN */), adminController.getAdminStats);
router5.get("/users/:userId", auth_default("ADMIN" /* ADMIN */), adminController.getUserById);
router5.put(
  "/users/:userId",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
var adminRouter = router5;

// src/modules/me/me.route.ts
import express6 from "express";

// src/modules/me/me.service.ts
var getUserInfo = async (userId) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  return result;
};
var meServcie = {
  getUserInfo
};

// src/modules/me/me.controller.ts
var getUserInfo2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const result = await meServcie.getUserInfo(user.id);
    res.json({
      success: true,
      message: "User info fetched Successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "User info fetching failed"
    });
  }
};
var meController = {
  getUserInfo: getUserInfo2
};

// src/modules/me/me.route.ts
var router6 = express6.Router();
router6.get("/", auth_default("USER" /* USER */, "ADMIN" /* ADMIN */, "PROVIDER" /* PROVIDER */), meController.getUserInfo);
var meRouter = router6;

// src/modules/reviews/review.route.ts
import express7 from "express";

// src/modules/reviews/review.service.ts
var createReview = async (userId, payload) => {
  const hasOrdered = await prisma.orders.findFirst({
    where: {
      userId,
      status: OrdersStatus.DELIVERED,
      orderItems: { some: { mealsId: payload.mealsId } }
    },
    include: {
      orderItems: true
    }
  });
  if (!hasOrdered) {
    throw new Error(
      "You have not ordered this food or The food is not delivered yet!!"
    );
  }
  const alreadyReviewed = await prisma.reviews.findFirst({
    where: {
      userId,
      mealsId: payload.mealsId
    }
  });
  if (alreadyReviewed) {
    throw new Error("You have already reviewed this food");
  }
  const result = await prisma.reviews.create({
    data: {
      ratings: Number(payload.ratings),
      comment: payload.comment,
      userId,
      mealsId: payload.mealsId
    }
  });
  return result;
};
var reviewService = {
  createReview
};

// src/modules/reviews/review.controller.ts
var createReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You must login before creating Reviews!");
    }
    const result = await reviewService.createReview(user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Your reviews Created Successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Review Creation Failed",
      error: error.message
    });
  }
};
var reviewController = {
  createReview: createReview2
};

// src/modules/reviews/review.route.ts
var router7 = express7.Router();
router7.post("/", auth_default("USER" /* USER */), reviewController.createReview);
var reviewRouter = router7;

// src/app.ts
var app = express8();
app.use(cors(
  {
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
    // 
  }
));
app.use(express8.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.get("/", (req, res) => {
  res.send("Hello from FoodHub Server");
});
app.use("/admin", adminRouter);
app.use("/me", meRouter);
app.use("/admin", categoryRouter);
app.use("/meals", mealsRouter);
app.use("/provider", providerRouter);
app.use("/orders", orderRouter);
app.use("/reviews", reviewRouter);
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
