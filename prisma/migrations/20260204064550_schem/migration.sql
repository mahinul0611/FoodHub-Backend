-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_orderId_fkey";

-- AlterTable
ALTER TABLE "OrderItems" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "status" SET DEFAULT 'PLACED';

-- CreateIndex
CREATE INDEX "Orders_userId_idx" ON "Orders"("userId");

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
