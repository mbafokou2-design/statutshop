-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTO', 'CAR', 'BICYCLE', 'WALKING');

-- CreateTable
CREATE TABLE "delivery_partners" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp_num" TEXT NOT NULL,
    "avatar_url" TEXT,
    "city" TEXT NOT NULL,
    "covered_zones" TEXT[],
    "vehicle_type" "VehicleType" NOT NULL,
    "base_price" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_partners_phone_key" ON "delivery_partners"("phone");

-- CreateIndex
CREATE INDEX "delivery_partners_city_idx" ON "delivery_partners"("city");
