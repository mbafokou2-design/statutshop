import { api } from '../lib/api';
import type { StoreSettings, TelegramStatus } from '../types';

export interface SettingsFormData {
  storeName?: string;
  whatsappBusinessNum?: string;
  city?: string;
  neighborhood?: string;
  description?: string;
  logoFile?: File | null;
  coverFile?: File | null;
}

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await api.get('/settings');
  return res.data.settings;
}

export async function updateSettings(data: SettingsFormData): Promise<StoreSettings> {
  // Le logo et la couverture sont 2 champs image distincts, mais notre route
  // backend n'accepte qu'un seul fichier par requête (via ?target=logo|cover).
  let latest: StoreSettings | null = null;

  const textFields: Partial<SettingsFormData> = { ...data };
  delete textFields.logoFile;
  delete textFields.coverFile;

  if (data.logoFile) {
    const fd = new FormData();
    Object.entries(textFields).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
    fd.append('image', data.logoFile);
    const res = await api.put('/settings?target=logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    latest = res.data.settings;
  }

  if (data.coverFile) {
    const fd = new FormData();
    if (!latest) Object.entries(textFields).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
    fd.append('image', data.coverFile);
    const res = await api.put('/settings?target=cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    latest = res.data.settings;
  }

  if (!latest) {
    const res = await api.put('/settings', textFields);
    latest = res.data.settings;
  }

  return latest!;
}

export async function changePassword(currentPassword: string | undefined, newPassword: string): Promise<void> {
  await api.put('/auth/change-password', { currentPassword, newPassword });
}

export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const res = await api.get('/auth/telegram-status');
  return res.data;
}