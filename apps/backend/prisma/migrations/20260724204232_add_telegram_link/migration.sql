/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `telegram_links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_chat_id_key" ON "telegram_links"("chat_id");
