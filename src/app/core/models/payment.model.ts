export interface Payment {
  paymentId: number;
  orderId: number;
  amount: number;
  transactionId: string;
  paymentMethod: 'PAYPAL' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
}

export interface PaymentRequest {
  orderId: number;
  paymentMethod: 'PAYPAL' | 'CREDIT_CARD' | 'BANK_TRANSFER';
}

export interface RefundRequest {
  orderId: number;
  reason?: string;
}