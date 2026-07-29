export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  transactionType: 'RECEIVED_STOCK' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED';
  quantity: number;
  referenceId: number;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: string;
  notes: string;
}

export interface StockAdjustmentRequest {
  productId: number;
  adjustmentDelta: number;
  reason: string;
}

export interface InventoryReport {
  productId: number;
  productName: string;
  productSku: string;
  currentStock: number;
  totalReceived: number;
  totalSold: number;
  totalReturned: number;
  totalDamaged: number;
  totalAdjusted: number;
  currentStockValue: number;
  lastTransactionDate: string;
  recentTransactions: InventoryTransactionSummary[];
}

export interface InventoryTransactionSummary {
  type: string;
  quantity: number;
  date: string;
  referenceInfo: string;
}