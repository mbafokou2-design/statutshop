export type AuthScreen = 'login' | 'register';
export type OtpChannel = 'telegram' | 'sms';

export interface StoreSettings {
  storeName: string;
}

export interface User {
  id: string;
  phone: string;
  storeName: string;
  storeSlug: string;
}

export type ProductCategory =
  | 'VETEMENTS'
  | 'SACS_ACCESSOIRES'
  | 'CHAUSSURES'
  | 'BEAUTE_CHEVEUX'
  | 'HIGH_TECH_GADGETS';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  VETEMENTS: 'Vêtements',
  SACS_ACCESSOIRES: 'Sacs & Accessoires',
  CHAUSSURES: 'Chaussures',
  BEAUTE_CHEVEUX: 'Beauté & Cheveux',
  HIGH_TECH_GADGETS: 'High-Tech & Gadgets',
};

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: ProductCategory;
  priceSelling: number;
  priceWholesale: number;
  stockQty: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeSlug: string;
  whatsappBusinessNum: string;
  city: string;
  neighborhood: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
}

export interface PublicOrderPayload {
  productId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  quantity: number;
}