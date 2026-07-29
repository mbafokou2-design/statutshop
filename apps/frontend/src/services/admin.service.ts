import { api } from '../lib/api';
import type { AdminOverviewStats, AdminShop } from '../types';

export async function fetchAdminOverview(): Promise<AdminOverviewStats> {
  const res = await api.get('/admin/overview');
  return res.data;
}

export async function fetchAllShops(search?: string, city?: string): Promise<AdminShop[]> {
  const res = await api.get('/admin/shops', { params: { search, city } });
  return res.data.shops;
}

export async function updateShopStatus(id: string, isActive: boolean): Promise<AdminShop> {
  const res = await api.put(`/admin/shops/${id}/status`, { isActive });
  return res.data.shop;
}

export async function deleteShop(id: string): Promise<void> {
  await api.delete(`/admin/shops/${id}`);
}

export async function fetchAdminAnalytics(): Promise<any> {
  const res = await api.get('/analytics/admin/analytics');
  return res.data;
}