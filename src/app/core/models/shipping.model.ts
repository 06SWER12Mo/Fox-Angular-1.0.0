export interface ShippingBatch {
  id: number;
  bigAreaName: string;
  bigAreaId: number;
  busPlateNumber: string;
  busId: number;
  driverName: string;
  status: 'COLLECTING_ORDERS' | 'READY_TO_DISPATCH' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  minimumOrders: number;
  currentOrderCount: number;
  createdAt: string;
  dispatchedAt: string;
  deliveredAt: string;
  autoDeliverAt: string;
  orders: ShippingOrderSummary[];
}

export interface ShippingOrderSummary {
  orderId: number;
  orderNumber: string;
  shippingName: string;
  shippingAddress: string;
}

export interface AssignBusRequest {
  batchId: number;
  busId: number;
}

export interface DeliveryConfirmationRequest {
  batchId: number;
  notes?: string;
}

export interface Bus {
  id: number;
  plateNumber: string;
  driverName: string;
  capacity: number;
  isActive: boolean;
  bigAreaId: number;
  bigAreaName: string;
  isAssigned: boolean;
  assignedBatchId: number;
  assignedBatchStatus: string;
}

export interface ShippingDashboard {
  totalBatches: number;
  collectingOrders: number;
  readyToDispatch: number;
  dispatched: number;
  delivered: number;
  cancelled: number;
  totalOrdersInBatches: number;
  pendingOrders: number;
  totalBuses: number;
  availableBuses: number;
  busyBuses: number;
  recentBatches: ShippingBatch[];
  urgentBatches: ShippingBatch[];
  lastBatchCreated: string;
  lastBatchDispatched: string;
  lastBatchDelivered: string;
}

export interface ShippingStats {
  periodStart: string;
  periodEnd: string;
  totalBatches: number;
  totalOrders: number;
  totalBatchesDelivered: number;
  totalOrdersDelivered: number;
  averageOrdersPerBatch: number;
  averageDeliveryTimeHours: number;
  averageTimeToDispatchHours: number;
  busUtilizationRate: number;
  dailyStats: ShippingDailyStats[];
}

export interface ShippingDailyStats {
  date: string;
  batchesCreated: number;
  batchesDispatched: number;
  batchesDelivered: number;
  ordersProcessed: number;
}