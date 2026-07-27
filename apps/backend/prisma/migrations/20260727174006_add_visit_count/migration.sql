/*
  Warnings:

  - Made the column `password_hash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "visit_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password_hash" SET NOT NULL,
ALTER COLUMN "city" DROP DEFAULT,
ALTER COLUMN "neighborhood" DROP DEFAULT;
