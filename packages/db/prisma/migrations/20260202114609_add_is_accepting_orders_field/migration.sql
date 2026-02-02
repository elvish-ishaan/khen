-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "isAcceptingOrders" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Restaurant_isAcceptingOrders_idx" ON "Restaurant"("isAcceptingOrders");
