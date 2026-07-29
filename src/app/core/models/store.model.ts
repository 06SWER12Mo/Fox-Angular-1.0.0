export interface StoreSettings {
  id: number;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  currencyCode: string;
  currencySymbol: string;
  taxRate: number;
  itemsPerPage: number;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StoreSettingsRequest {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeFavicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  defaultShippingCost?: number;
  freeShippingThreshold?: number;
  currencyCode?: string;
  currencySymbol?: string;
  taxRate?: number;
  itemsPerPage?: number;
  allowRegistration?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}