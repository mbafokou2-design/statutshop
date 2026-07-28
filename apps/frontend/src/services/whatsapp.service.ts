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