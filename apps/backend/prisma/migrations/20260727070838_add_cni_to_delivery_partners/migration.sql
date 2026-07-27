/*
  Warnings:

  - Added the required column `cni_number` to the `delivery_partners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cni_photo_url` to the `delivery_partners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "delivery_partners" ADD COLUMN     "cni_number" TEXT NOT NULL,
ADD COLUMN     "cni_photo_url" TEXT NOT NULL;
