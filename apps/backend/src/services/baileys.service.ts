import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { prisma } from '../lib/prisma';
import { usePrismaAuthState } from '../lib/baileysAuthState';

const activeSockets = new Map<string, any>();
const logger = pino({ level: 'silent' });

export async function startWhatsAppConnection(vendeurId: string, phoneNumber: string) {
  const { state, saveCreds } = await usePrismaAuthState(vendeurId);

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
  });

  activeSockets.set(vendeurId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      await prisma.whatsAppSession.upsert({
        where: { vendeurId },
        update: { isConnected: true, phoneNumber },
        create: { vendeurId, sessionData: '', isConnected: true, phoneNumber },
      });
    }

    if (connection === 'close') {
      await prisma.whatsAppSession.updateMany({
        where: { vendeurId },
        data: { isConnected: false },
      });

      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      activeSockets.delete(vendeurId);

      if (shouldReconnect) {
        startWhatsAppConnection(vendeurId, phoneNumber).catch(() => {});
      }
    }
  });

  // Écoute des messages entrants -> ne garde que ceux liés à une commande StatutShop
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid.endsWith('@g.us')) continue; // ignore les groupes

      const senderPhone = '+' + remoteJid.split('@')[0];

      const matchingOrder = await prisma.order.findFirst({
        where: { vendeurId, customerPhone: senderPhone },
      });

      if (matchingOrder) {
        await prisma.whatsAppContactActivity.upsert({
          where: { vendeurId_customerPhone: { vendeurId, customerPhone: senderPhone } },
          update: { lastMessageAt: new Date() },
          create: { vendeurId, customerPhone: senderPhone, lastMessageAt: new Date() },
        });
      }
      // Sinon : contact non lié à une commande StatutShop -> ignoré volontairement
    }
  });

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
    return { pairingCode: code };
  }

  return { pairingCode: null };
}

export function getActiveSocket(vendeurId: string) {
  return activeSockets.get(vendeurId);
}

export async function disconnectWhatsApp(vendeurId: string) {
  const sock = activeSockets.get(vendeurId);
  if (sock) {
    await sock.logout().catch(() => {});
    activeSockets.delete(vendeurId);
  }
  await prisma.whatsAppSession.updateMany({
    where: { vendeurId },
    data: { isConnected: false },
  });
}

export async function sendRelanceMessage(vendeurId: string, customerPhone: string, message: string) {
  const activity = await prisma.whatsAppContactActivity.findUnique({
    where: { vendeurId_customerPhone: { vendeurId, customerPhone } },
  });

  if (!activity) {
    throw new Error("Ce client n'a pas encore écrit via WhatsApp, impossible d'envoyer une relance.");
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (activity.lastMessageAt < twentyFourHoursAgo) {
    throw new Error('La fenêtre de 24h pour répondre à ce client est expirée.');
  }

  const sock = activeSockets.get(vendeurId);
  if (!sock) {
    throw new Error("WhatsApp n'est pas connecté pour ce vendeur.");
  }

  const jid = customerPhone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await sock.sendMessage(jid, { text: message });
}