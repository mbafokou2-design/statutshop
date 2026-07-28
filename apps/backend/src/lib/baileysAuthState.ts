import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';
import { prisma } from './prisma';
import { encrypt, decrypt } from './encryption';

interface StoredData {
  creds: any;
  keys: Record<string, Record<string, any>>;
}

export async function usePrismaAuthState(vendeurId: string) {
  const existing = await prisma.whatsAppSession.findUnique({ where: { vendeurId } });

  let stored: StoredData;
  if (existing?.sessionData) {
    try {
      const decrypted = decrypt(existing.sessionData);
      stored = JSON.parse(decrypted, BufferJSON.reviver);
    } catch {
      stored = { creds: initAuthCreds(), keys: {} };
    }
  } else {
    stored = { creds: initAuthCreds(), keys: {} };
  }

  const writeData = async () => {
    const serialized = JSON.stringify(stored, BufferJSON.replacer);
    const encrypted = encrypt(serialized);
    await prisma.whatsAppSession.upsert({
      where: { vendeurId },
      update: { sessionData: encrypted },
      create: { vendeurId, sessionData: encrypted },
    });
  };

  return {
    state: {
      creds: stored.creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: Record<string, any> = {};
          for (const id of ids) {
            let value = stored.keys[type]?.[id];
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            if (value) data[id] = value;
          }
          return data;
        },
        set: async (data: any) => {
          for (const category in data) {
            stored.keys[category] = stored.keys[category] || {};
            for (const id in data[category]) {
              const value = data[category][id];
              if (value) stored.keys[category][id] = value;
              else delete stored.keys[category][id];
            }
          }
          await writeData();
        },
      },
    },
    saveCreds: writeData,
  };
}