/*
  Warnings:

  - You are about to drop the column `address` on the `ProvidersProfile` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ProvidersProfile` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `ProvidersProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `ProvidersProfile` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProvidersProfile" DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "openingHours",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "address",
ALTER COLUMN "phone" DROP DEFAULT;
