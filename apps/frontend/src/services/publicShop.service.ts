import { api } from '../lib/api';
import type { Product, StoreSettings, PublicOrderPayload } from '../types';

export async function fetchPublicStore(storeSlug: string): Promise<{ vendeur: StoreSettings; products: Product[] }> {
  const res = await api.get(`/shop/${storeSlug}`);
  return res.data;
}

export async function submitPublicOrder(storeSlug: string, payload: PublicOrderPayload) {
  const res = await api.post(`/shop/${storeSlug}/orders`, payload);
  return res.data.order;
}

export async function fetchPublicProduct(storeSlug: string, productSlug: string): Promise<{ vendeur: StoreSettings; product: Product }> {
  const res = await api.get(`/shop/${storeSlug}/product/${productSlug}`);
  return res.data;
}