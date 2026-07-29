export interface Receipt {
  id: number;
  receiptNumber: string;
  receiptDate: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  status: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptType: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  createdById: number;
  createdByName: string;
  approvedById: number;
  approvedByName: string;
  approvedAt: string;
  items: ReceiptItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  notes: string;
}

export interface ReceiptRequest {
  receiptDate?: string;
  supplierId: number;
  notes?: string;
  paymentMethod?: string;
  receiptType?: string;
  shippingCost?: number;
  discountAmount?: number;
  items: ReceiptItemRequest[];
}

export interface ReceiptItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  notes?: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  taxId: string;
  registrationNumber: string;
  notes: string;
  active: boolean;
  paymentTerms: string;
  deliveryTerms: string;
  receiptCount: number;
  fullAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  taxId?: string;
  registrationNumber?: string;
  notes?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
}