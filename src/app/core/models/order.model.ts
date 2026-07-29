export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  shippingName: string;
  shippingPhone: string;
  shippingTownName: string;
  shippingStreet: string;
  shippingBuilding: string;
  latitude: number;
  longitude: number;
  subtotal: number;
  shippingCost: number;
  totalPrice: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING_PAYMENT' | 'PAID' | 'READY_FOR_SHIPPING' | 'ASSIGNED_TO_BATCH' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingCode: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  userName: string;
  totalPrice: number;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string;
  createdAt: string;
  itemCount: number;
}

export interface PlaceOrderRequest {
  deliveryAddressId: number;
  cartId: number;
}

export interface UpdateOrderStatusRequest {
  orderStatus: string;
  trackingCode?: string;
}

export interface OrderTrackingRequest {
  trackingCode: string;
}

export interface TrackingResponse {
  orderNumber: string;
  userName: string;
  shippingName: string;
  shippingAddress: string;
  totalPrice: number;
  currentStatus: string;
  trackingCode: string;
  createdAt: string;
  trackingHistory: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  description: string;
  timestamp: string;
}