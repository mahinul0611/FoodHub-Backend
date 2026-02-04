/*
  Warnings:

  - You are about to alter the column `price` on the `Meals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Meals" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProvidersProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
