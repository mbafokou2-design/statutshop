/*
  Warnings:

  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('VETEMENTS', 'SACS_ACCESSOIRES', 'CHAUSSURES', 'BEAUTE_CHEVEUX', 'HIGH_TECH_GADGETS');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" "ProductCategory" NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true;
