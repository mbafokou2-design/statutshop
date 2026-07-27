-- CreateTable
CREATE TABLE "delivery_partner_ratings" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "vendeur_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_partner_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_partner_ratings_partner_id_vendeur_id_key" ON "delivery_partner_ratings"("partner_id", "vendeur_id");

-- AddForeignKey
ALTER TABLE "delivery_partner_ratings" ADD CONSTRAINT "delivery_partner_ratings_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "delivery_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_partner_ratings" ADD CONSTRAINT "delivery_partner_ratings_vendeur_id_fkey" FOREIGN KEY ("vendeur_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
