-- CreateTable
CREATE TABLE "telegram_links" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_phone_key" ON "telegram_links"("phone");
