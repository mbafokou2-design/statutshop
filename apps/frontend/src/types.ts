export type AuthScreen = 'login' | 'register';
// 🟢 Remplacement de 'sms' par 'whatsapp'
export type OtpChannel = 'telegram' | 'whatsapp';

// ❌ 'StoreSettings' (version incomplète) supprimé d'ici pour éviter les conflits de types

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

// 🟢 Version unique et complète de StoreSettings
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

export type VehicleType = 'MOTO' | 'CAR' | 'BICYCLE' | 'WALKING';

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTO: 'Moto',
  CAR: 'Voiture',
  BICYCLE: 'Vélo',
  WALKING: 'À pied',
};

export interface DeliveryPartner {
  id: string;
  fullName: string;
  whatsappNum: string;
  avatarUrl: string | null;
  city: string;
  coveredZones: string[];
  vehicleType: VehicleType;
  basePrice: string | null;
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
}

export interface TelegramStatus {
  linked: boolean;
  botUsername: string | null;
}

export type BackendOrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemDisplay {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    priceWholesale: number;
  };
}

export interface OrderDisplay {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  deliveryFee: number;
  totalAmount: number;
  status: BackendOrderStatus;
  createdAt: string;
  items: OrderItemDisplay[];
}

export type FinancePeriod = 'today' | 'week' | 'month';

export interface FinanceLedgerEntry {
  id: string;
  orderNumber: string;
  customerName: string;
  productTitle: string;
  totalAmount: number;
  wholesaleCost: number;
  deliveryFee: number;
  netProfit: number;
  createdAt: string;
}

export interface FinanceSummary {
  period: FinancePeriod;
  totalCA: number;
  totalWholesale: number;
  totalDeliveryFees: number;
  netProfitInPocket: number;
  profitMarginPercent: number;
  deliveredOrdersCount: number;
  ledger: FinanceLedgerEntry[];
}

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber: string | null;
}

export interface WhatsAppConnectResponse {
  pairingCode: string | null;
}