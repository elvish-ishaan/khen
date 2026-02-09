/*
  Warnings:

  - You are about to drop the `OtpVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OtpVerification" DROP CONSTRAINT "OtpVerification_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RestaurantOwner" ADD COLUMN     "fcmToken" TEXT;

-- DropTable
DROP TABLE "OtpVerification";
