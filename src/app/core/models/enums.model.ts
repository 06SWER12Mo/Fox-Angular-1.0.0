// ============================================================
// AUTH & USER ENUMS
// ============================================================

export enum Role {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

// ============================================================
// ORDER ENUMS
// ============================================================

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  READY_FOR_SHIPPING = 'READY_FOR_SHIPPING',
  ASSIGNED_TO_BATCH = 'ASSIGNED_TO_BATCH',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum TrackingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  READY_FOR_SHIPPING = 'READY_FOR_SHIPPING',
  ASSIGNED_TO_BATCH = 'ASSIGNED_TO_BATCH',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// ============================================================
// PAYMENT ENUMS
// ============================================================

export enum PaymentMethod {
  PAYPAL = 'PAYPAL',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// ============================================================
// SHIPPING ENUMS
// ============================================================

export enum ShippingStatus {
  COLLECTING_ORDERS = 'COLLECTING_ORDERS',
  READY_TO_DISPATCH = 'READY_TO_DISPATCH',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// ============================================================
// INVENTORY ENUMS
// ============================================================

export enum InventoryTransactionType {
  RECEIVED_STOCK = 'RECEIVED_STOCK',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  DAMAGED = 'DAMAGED'
}

// ============================================================
// HELPER FUNCTIONS - ORDER STATUS
// ============================================================

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: 'Pending Payment',
    [OrderStatus.PAID]: 'Paid',
    [OrderStatus.READY_FOR_SHIPPING]: 'Ready for Shipping',
    [OrderStatus.ASSIGNED_TO_BATCH]: 'Assigned to Batch',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled'
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: 'warning',
    [OrderStatus.PAID]: 'primary',
    [OrderStatus.READY_FOR_SHIPPING]: 'accent',
    [OrderStatus.ASSIGNED_TO_BATCH]: 'accent',
    [OrderStatus.SHIPPED]: 'primary',
    [OrderStatus.DELIVERED]: 'success',
    [OrderStatus.CANCELLED]: 'danger'
  };
  return colors[status] || 'default';
}

export function getOrderStatusClass(status: OrderStatus): string {
  const classes: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: 'status-pending',
    [OrderStatus.PAID]: 'status-paid',
    [OrderStatus.READY_FOR_SHIPPING]: 'status-ready',
    [OrderStatus.ASSIGNED_TO_BATCH]: 'status-assigned',
    [OrderStatus.SHIPPED]: 'status-shipped',
    [OrderStatus.DELIVERED]: 'status-delivered',
    [OrderStatus.CANCELLED]: 'status-cancelled'
  };
  return classes[status] || '';
}

// ============================================================
// HELPER FUNCTIONS - PAYMENT STATUS
// ============================================================

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Pending',
    [PaymentStatus.PAID]: 'Paid',
    [PaymentStatus.FAILED]: 'Failed',
    [PaymentStatus.REFUNDED]: 'Refunded'
  };
  return labels[status] || status;
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'warning',
    [PaymentStatus.PAID]: 'success',
    [PaymentStatus.FAILED]: 'danger',
    [PaymentStatus.REFUNDED]: 'info'
  };
  return colors[status] || 'default';
}

// ============================================================
// HELPER FUNCTIONS - SHIPPING STATUS
// ============================================================

export function getShippingStatusLabel(status: ShippingStatus): string {
  const labels: Record<ShippingStatus, string> = {
    [ShippingStatus.COLLECTING_ORDERS]: 'Collecting Orders',
    [ShippingStatus.READY_TO_DISPATCH]: 'Ready to Dispatch',
    [ShippingStatus.DISPATCHED]: 'Dispatched',
    [ShippingStatus.DELIVERED]: 'Delivered',
    [ShippingStatus.CANCELLED]: 'Cancelled'
  };
  return labels[status] || status;
}

export function getShippingStatusColor(status: ShippingStatus): string {
  const colors: Record<ShippingStatus, string> = {
    [ShippingStatus.COLLECTING_ORDERS]: 'warning',
    [ShippingStatus.READY_TO_DISPATCH]: 'accent',
    [ShippingStatus.DISPATCHED]: 'primary',
    [ShippingStatus.DELIVERED]: 'success',
    [ShippingStatus.CANCELLED]: 'danger'
  };
  return colors[status] || 'default';
}

// ============================================================
// HELPER FUNCTIONS - INVENTORY
// ============================================================

export function getInventoryTransactionLabel(type: InventoryTransactionType): string {
  const labels: Record<InventoryTransactionType, string> = {
    [InventoryTransactionType.RECEIVED_STOCK]: 'Received Stock',
    [InventoryTransactionType.SALE]: 'Sale',
    [InventoryTransactionType.RETURN]: 'Return',
    [InventoryTransactionType.ADJUSTMENT]: 'Adjustment',
    [InventoryTransactionType.DAMAGED]: 'Damaged'
  };
  return labels[type] || type;
}

export function getInventoryTransactionIcon(type: InventoryTransactionType): string {
  const icons: Record<InventoryTransactionType, string> = {
    [InventoryTransactionType.RECEIVED_STOCK]: 'inventory_2',
    [InventoryTransactionType.SALE]: 'sell',
    [InventoryTransactionType.RETURN]: 'replay',
    [InventoryTransactionType.ADJUSTMENT]: 'tune',
    [InventoryTransactionType.DAMAGED]: 'warning'
  };
  return icons[type] || 'help';
}

export function isStockIn(type: InventoryTransactionType): boolean {
  return type === InventoryTransactionType.RECEIVED_STOCK || 
         type === InventoryTransactionType.RETURN;
}

export function isStockOut(type: InventoryTransactionType): boolean {
  return type === InventoryTransactionType.SALE || 
         type === InventoryTransactionType.DAMAGED;
}

// ============================================================
// HELPER FUNCTIONS - GENERAL
// ============================================================

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    [Role.USER]: 'User',
    [Role.MANAGER]: 'Manager',
    [Role.ADMIN]: 'Administrator'
  };
  return labels[role] || role;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.PAYPAL]: 'PayPal',
    [PaymentMethod.CREDIT_CARD]: 'Credit Card',
    [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer'
  };
  return labels[method] || method;
}