-- CreateEnum
CREATE TYPE "DeliveryOnboardingStatus" AS ENUM ('PENDING_DOCUMENTS', 'PENDING_BANK_DETAILS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryDocumentType" AS ENUM ('AADHAR_CARD', 'DRIVING_LICENSE');

-- AlterTable
ALTER TABLE "DeliveryPersonnel" ADD COLUMN     "fcmToken" TEXT,
ADD COLUMN     "isOnDuty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLocationUpdate" TIMESTAMP(3),
ADD COLUMN     "onboardingStatus" "DeliveryOnboardingStatus" NOT NULL DEFAULT 'PENDING_DOCUMENTS',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "vehicleType" DROP NOT NULL,
ALTER COLUMN "vehicleNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DeliveryDocument" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "type" "DeliveryDocumentType" NOT NULL,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryBankDetails" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "accountTitle" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryBankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'ASSIGNED',
    "distance" DOUBLE PRECISION,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pickupTime" TIMESTAMP(3),
    "deliveryTime" TIMESTAMP(3),
    "estimatedArrivalTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLocationHistory" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryEarning" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderBroadcast" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryDocument_personnelId_idx" ON "DeliveryDocument"("personnelId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryDocument_personnelId_type_key" ON "DeliveryDocument"("personnelId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryBankDetails_personnelId_key" ON "DeliveryBankDetails"("personnelId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_orderId_idx" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_personnelId_idx" ON "Delivery"("personnelId");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_createdAt_idx" ON "Delivery"("createdAt");

-- CreateIndex
CREATE INDEX "DeliveryLocationHistory_personnelId_idx" ON "DeliveryLocationHistory"("personnelId");

-- CreateIndex
CREATE INDEX "DeliveryLocationHistory_recordedAt_idx" ON "DeliveryLocationHistory"("recordedAt");

-- CreateIndex
CREATE INDEX "DeliveryEarning_personnelId_idx" ON "DeliveryEarning"("personnelId");

-- CreateIndex
CREATE INDEX "DeliveryEarning_createdAt_idx" ON "DeliveryEarning"("createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_personnelId_idx" ON "Withdrawal"("personnelId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_requestedAt_idx" ON "Withdrawal"("requestedAt");

-- CreateIndex
CREATE INDEX "OrderBroadcast_orderId_idx" ON "OrderBroadcast"("orderId");

-- CreateIndex
CREATE INDEX "OrderBroadcast_personnelId_idx" ON "OrderBroadcast"("personnelId");

-- CreateIndex
CREATE INDEX "OrderBroadcast_sentAt_idx" ON "OrderBroadcast"("sentAt");

-- CreateIndex
CREATE INDEX "DeliveryPersonnel_isOnDuty_idx" ON "DeliveryPersonnel"("isOnDuty");

-- CreateIndex
CREATE INDEX "DeliveryPersonnel_onboardingStatus_idx" ON "DeliveryPersonnel"("onboardingStatus");

-- CreateIndex
CREATE INDEX "DeliveryPersonnel_latitude_longitude_idx" ON "DeliveryPersonnel"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "DeliveryDocument" ADD CONSTRAINT "DeliveryDocument_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryBankDetails" ADD CONSTRAINT "DeliveryBankDetails_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLocationHistory" ADD CONSTRAINT "DeliveryLocationHistory_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryEarning" ADD CONSTRAINT "DeliveryEarning_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "DeliveryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBroadcast" ADD CONSTRAINT "OrderBroadcast_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
