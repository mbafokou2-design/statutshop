import { api } from '../lib/api';
import type { WhatsAppStatus, WhatsAppConnectResponse } from '../types';

export async function fetchWhatsAppStatus(): Promise<WhatsAppStatus> {
  const res = await api.get('/whatsapp/status');
  return res.data;
}

export async function connectWhatsApp(phoneNumber: string): Promise<WhatsAppConnectResponse> {
  const res = await api.post('/whatsapp/connect', { phoneNumber });
  return res.data;
}

export async function disconnectWhatsApp(): Promise<void> {
  await api.post('/whatsapp/disconnect');
}

export async function fetchPublicShopsCount(): Promise<number> {
  try {
    const res = await api.get('/shop/info/shops-count');
    return typeof res.data?.count === 'number' ? res.data.count : 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de boutiques:', error);
    return 0;
  }
}