/*
  Warnings:

  - Added the required column `address` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProvidersProfile" ADD COLUMN     "address" TEXT DEFAULT 'null',
ADD COLUMN     "description" TEXT DEFAULT 'null',
ADD COLUMN     "openingHours" TEXT DEFAULT 'null',
ADD COLUMN     "phone" TEXT DEFAULT 'null';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "address" TEXT NOT NULL,
ALTER COLUMN "phone" SET DEFAULT 'null';
