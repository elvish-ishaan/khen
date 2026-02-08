/*
  Warnings:

  - You are about to drop the column `closesAt` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDeliveryTime` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderAmount` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `opensAt` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "closesAt",
DROP COLUMN "deliveryFee",
DROP COLUMN "estimatedDeliveryTime",
DROP COLUMN "minOrderAmount",
DROP COLUMN "opensAt";
