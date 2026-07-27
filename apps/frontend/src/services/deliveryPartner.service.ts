import { api } from '../lib/api';
import type { DeliveryPartner } from '../types';

export async function fetchDeliveryPartners(city?: string): Promise<DeliveryPartner[]> {
  const params = city ? { city } : {};
  const res = await api.get('/delivery-partners', { params });
  return res.data.partners;
}

export async function fetchDeliveryPartnerCities(): Promise<string[]> {
  const res = await api.get('/delivery-partners/cities');
  return res.data.cities;
}

export async function rateDeliveryPartner(partnerId: string, rating: number): Promise<DeliveryPartner> {
  const res = await api.post(`/delivery-partners/${partnerId}/rate`, { rating });
  return res.data.partner;
}