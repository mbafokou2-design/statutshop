-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VENDEUR', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'VENDEUR';
