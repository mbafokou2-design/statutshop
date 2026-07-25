-- AlterTable
ALTER TABLE "otp_codes" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'sms';

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "id" TEXT NOT NULL,
    "vendeur_id" TEXT NOT NULL,
    "session_data" TEXT NOT NULL,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_sessions_vendeur_id_key" ON "whatsapp_sessions"("vendeur_id");
