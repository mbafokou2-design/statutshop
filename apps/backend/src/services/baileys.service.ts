import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { prisma } from '../lib/prisma';
import { usePrismaAuthState } from '../lib/baileysAuthState';

const activeSockets = new Map<string, any>();
const logger = pino({ level: 'silent' });

export async function startWhatsAppConnection(vendeurId: string, phoneNumber: string) {
  // 0. Si une socket active existe déjà sans être connectée, fermer proprement
  if (activeSockets.has(vendeurId)) {
    try {
      const oldSock = activeSockets.get(vendeurId);
      oldSock.ev.removeAllListeners('connection.update');
      oldSock.ev.removeAllListeners('creds.update');
      oldSock.ws?.close();
    } catch (e) {}
    activeSockets.delete(vendeurId);
  }

  // 1. Récupération / Création des identifiants
  const { state, saveCreds } = await usePrismaAuthState(vendeurId);

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'], // Format officiel reconnu par WhatsApp pour le Pairing Code
    markOnlineOnConnect: false,
  });

  activeSockets.set(vendeurId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`✅ WhatsApp connecté avec succès pour le vendeur : ${vendeurId}`);

      await prisma.whatsAppSession.upsert({
        where: { vendeurId },
        update: {
          isConnected: true,
          phoneNumber
        },
        create: {
          vendeurId,
          sessionData: JSON.stringify(state.creds),
          isConnected: true,
          phoneNumber
        },
      });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;

      console.warn(`⚠️ WhatsApp déconnecté (Raison: ${statusCode}). Reconnexion: ${!isLoggedOut}`);

      activeSockets.delete(vendeurId);

      if (isLoggedOut) {
        // 🟢 NETTOYAGE CRUCIAL : Si session 401, on supprime tout en BDD pour repartir à zéro !
        console.log(`🧹 Suppression de la session obsolète/corrompue pour le vendeur : ${vendeurId}`);
        await prisma.whatsAppSession.deleteMany({
          where: { vendeurId },
        }).catch(() => { });
      } else {
        // Si simple déconnexion réseau, on met à jour et re-essaie
        await prisma.whatsAppSession.updateMany({
          where: { vendeurId },
          data: { isConnected: false },
        }).catch(() => { });

        startWhatsAppConnection(vendeurId, phoneNumber).catch(() => { });
      }
    }
  });

  // Écoute des messages entrants
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid.endsWith('@g.us')) continue;

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
    }
  });

  if (!sock.authState.creds.registered) {
    // Retire le '+' et tous les caractères non numériques
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Laisser le temps à la connexion WebSocket de s'enregistrer auprès de WhatsApp
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const code = await sock.requestPairingCode(cleanPhone);
      return { pairingCode: code };
    } catch (error: any) {
      console.error('❌ Erreur pairing code:', error);
      activeSockets.delete(vendeurId);
      throw new Error("Échec de la génération du code. Vérifiez l'indicatif du numéro.");
    }
  }

  return { pairingCode: null };
}

export function getActiveSocket(vendeurId: string) {
  return activeSockets.get(vendeurId);
}

export async function disconnectWhatsApp(vendeurId: string) {
  const sock = activeSockets.get(vendeurId);
  if (sock) {
    await sock.logout().catch(() => { });
    activeSockets.delete(vendeurId);
  }
  await prisma.whatsAppSession.deleteMany({
    where: { vendeurId },
  }).catch(() => { });
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