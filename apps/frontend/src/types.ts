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