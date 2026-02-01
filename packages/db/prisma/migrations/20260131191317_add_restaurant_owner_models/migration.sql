-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING_DOCUMENTS', 'PENDING_BANK_DETAILS', 'PENDING_MENU', 'PENDING_LOCATION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FSSAI_CERTIFICATE', 'PAN_CARD', 'AADHAR', 'GSTIN');

-- CreateTable
CREATE TABLE "RestaurantOwner" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING_DOCUMENTS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" TEXT,

    CONSTRAINT "RestaurantOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantDocument" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "accountTitle" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwner_phone_key" ON "RestaurantOwner"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwner_restaurantId_key" ON "RestaurantOwner"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantOwner_phone_idx" ON "RestaurantOwner"("phone");

-- CreateIndex
CREATE INDEX "RestaurantDocument_ownerId_idx" ON "RestaurantDocument"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantDocument_ownerId_type_key" ON "RestaurantDocument"("ownerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_ownerId_key" ON "BankDetails"("ownerId");

-- AddForeignKey
ALTER TABLE "RestaurantOwner" ADD CONSTRAINT "RestaurantOwner_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDocument" ADD CONSTRAINT "RestaurantDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "RestaurantOwner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "RestaurantOwner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
