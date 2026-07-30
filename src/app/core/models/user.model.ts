import { DeliveryAddress } from './location.model';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePictureUrl: string;
  enabled: boolean;
  locked?: boolean;
  emailVerified: boolean;
  verificationRequested: boolean;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  deliveryAddresses?: DeliveryAddress[];
  addresses?: DeliveryAddress[];
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}