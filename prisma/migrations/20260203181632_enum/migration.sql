/*
  Warnings:

  - The values [PENDING,CANCELED,COMPLETED] on the enum `OrdersStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `User Reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrdersStatus_new" AS ENUM ('PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Orders" ALTER COLUMN "status" TYPE "OrdersStatus_new" USING ("status"::text::"OrdersStatus_new");
ALTER TYPE "OrdersStatus" RENAME TO "OrdersStatus_old";
ALTER TYPE "OrdersStatus_new" RENAME TO "OrdersStatus";
DROP TYPE "public"."OrdersStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "User Reviews" DROP CONSTRAINT "User Reviews_mealsId_fkey";

-- DropForeignKey
ALTER TABLE "User Reviews" DROP CONSTRAINT "User Reviews_userId_fkey";

-- DropTable
DROP TABLE "User Reviews";

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "ratings" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "mealsId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_ratings_idx" ON "reviews"("ratings");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_mealsId_fkey" FOREIGN KEY ("mealsId") REFERENCES "Meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
