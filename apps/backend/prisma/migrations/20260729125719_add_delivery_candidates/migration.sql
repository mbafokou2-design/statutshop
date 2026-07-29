-- CreateTable
CREATE TABLE "delivery_candidates" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp_num" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "covered_zones" TEXT[],
    "vehicle_type" "VehicleType" NOT NULL,
    "base_price" TEXT,
    "cni_number" TEXT NOT NULL,
    "motivation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_candidates_phone_key" ON "delivery_candidates"("phone");

-- CreateIndex
CREATE INDEX "delivery_candidates_status_idx" ON "delivery_candidates"("status");
