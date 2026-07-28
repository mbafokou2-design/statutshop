-- CreateTable
CREATE TABLE "whatsapp_contact_activity" (
    "id" TEXT NOT NULL,
    "vendeur_id" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_contact_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_contact_activity_vendeur_id_idx" ON "whatsapp_contact_activity"("vendeur_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_contact_activity_vendeur_id_customer_phone_key" ON "whatsapp_contact_activity"("vendeur_id", "customer_phone");
