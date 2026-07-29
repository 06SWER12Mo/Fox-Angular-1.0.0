export interface BigArea {
  id: number;
  name: string;
  code: string;
  description: string;
  active: boolean;
  displayOrder: number;
  townCount: number;
  towns: Town[];
  createdAt: string;
  updatedAt: string;
}

export interface BigAreaRequest {
  name: string;
  code?: string;
  description?: string;
  active?: boolean;
  displayOrder?: number;
}

export interface Town {
  id: number;
  name: string;
  code: string;
  zipCode: string;
  description: string;
  active: boolean;
  displayOrder: number;
  latitude: number;
  longitude: number;
  deliveryFee: number;
  deliveryAvailable: boolean;
  bigAreaId: number;
  bigAreaName: string;
  deliveryAddressCount: number;
  deliveryAddresses: DeliveryAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface TownRequest {
  name: string;
  code?: string;
  zipCode?: string;
  description?: string;
  active?: boolean;
  displayOrder?: number;
  latitude?: number;
  longitude?: number;
  deliveryFee?: number;
  deliveryAvailable?: boolean;
  bigAreaId: number;
}

export interface DeliveryAddress {
  id: number;
  addressLine1: string;
  addressLine2: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  isDefault: boolean;
  addressType: string;
  recipientName: string;
  recipientPhone: string;
  additionalInstructions: string;
  latitude: number;
  longitude: number;
  active: boolean;
  userId: number;
  userFullName: string;
  townId: number;
  townName: string;
  bigAreaName: string;
  fullAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  isDefault?: boolean;
  addressType?: string;
  recipientName?: string;
  recipientPhone?: string;
  additionalInstructions?: string;
  latitude?: number;
  longitude?: number;
  townId?: number;
}