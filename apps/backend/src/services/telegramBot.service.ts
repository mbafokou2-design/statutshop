import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../lib/prisma';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const isProd = process.env.NODE_ENV === 'production';
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || (isProd ? 'https://lavenderblush-crocodile-481124.hostingersite.com/api/v1/telegram-webhook' : '');

export const bot = new TelegramBot(TOKEN, {
  polling: !webhookUrl as any
});

if (webhookUrl) {
  bot.setWebHook(webhookUrl)
    .then(() => console.log(`[Telegram] Webhook set to ${webhookUrl}`))
    .catch((err) => console.error('[Telegram] Error setting webhook:', err));
} else {
  console.log('[Telegram] Polling enabled for updates');
}


bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const startParam = match ? match[1] : null;

  if (startParam) {
    const phone = startParam.startsWith('+') ? startParam : `+${startParam}`;

    try {
      // 1. On nettoie tout ancien numéro qui était lié à CE compte Telegram (chatId)
      await prisma.telegramLink.deleteMany({
        where: { chatId },
      });

      // 2. On lie (ou relie) le nouveau numéro au chatId
      await prisma.telegramLink.upsert({
        where: { phone },
        update: { chatId },
        create: { phone, chatId },
      });

      // 3. Message de confirmation au bot
      await bot.sendMessage(
        chatId,
        `✅ Votre compte Telegram est désormais lié au numéro *${phone}* !\n\nVous pouvez retourner sur StatutShop pour demander votre code.`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Erreur lors de la liaison Telegram:', error);
      await bot.sendMessage(
        chatId,
        "❌ Une erreur est survenue lors de la liaison de votre compte. Veuillez réessayer depuis le site."
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      "Bienvenue sur **StatutShop** ! 👋\n\nPour lier votre compte et recevoir vos codes de connexion ici, veuillez initier la demande directement depuis le site web.",
      { parse_mode: 'Markdown' }
    );
  }
});

export async function sendTelegramOtp(phone: string, code: string): Promise<void> {
  const link = await prisma.telegramLink.findUnique({ where: { phone } });

  if (!link) {
    throw new Error(
      "Ce numéro n'est pas encore lié à Telegram. Utilisez le lien de liaison généré sur le site."
    );
  }

  await bot.sendMessage(
    link.chatId,
    `🔑 Votre code de vérification StatutShop est : *${code}*\n\nIl expire dans 5 minutes.`,
    { parse_mode: 'Markdown' }
  );
}