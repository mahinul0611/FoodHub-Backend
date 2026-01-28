-- CreateEnum
CREATE TYPE "MealsStatus" AS ENUM ('AVAILABLE', 'STOCKOUT');

-- CreateEnum
CREATE TYPE "OrdersStatus" AS ENUM ('PENDING', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Meals" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(225) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "MealsStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOnDiet" BOOLEAN NOT NULL,

    CONSTRAINT "Meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(225) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" VARCHAR(30) NOT NULL,
    "status" "OrdersStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "mealsId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User Reviews" (
    "id" TEXT NOT NULL,
    "ratings" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "mealsId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- CreateIndex
CREATE INDEX "User Reviews_ratings_idx" ON "User Reviews"("ratings");

-- AddForeignKey
ALTER TABLE "User Reviews" ADD CONSTRAINT "User Reviews_mealsId_fkey" FOREIGN KEY ("mealsId") REFERENCES "Meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
