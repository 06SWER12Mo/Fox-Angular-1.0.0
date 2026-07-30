import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order.service';
import { PaymentService } from '../../../../core/services/api/payment.service';
import { Order } from '../../../../core/models/order.model';
import { OrderStatus, PaymentMethod } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  standalone: false
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  errorMessage = '';
  showCancelModal = false;
  isCancelling = false;
  showPayModal = false;
  selectedPayMethod: string = 'PAYPAL';
  isPaying = false;
  paymentMethods = Object.values(PaymentMethod);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadOrder(+params['id']);
      }
    });
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.getOrderById(id).subscribe({
      next: (response: any) => {
        this.order = response?.data || response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error?.error?.message || 'Failed to load order';
        console.error('Error loading order:', error);
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
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

  getStatusColor(status: OrderStatus): string {
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

  canCancel(): boolean {
    if (!this.order) return false;
    const status = this.order.orderStatus;
    return status === OrderStatus.PENDING_PAYMENT || 
           status === OrderStatus.PAID || 
           status === OrderStatus.READY_FOR_SHIPPING;
  }

  isPendingPayment(): boolean {
    return this.order?.orderStatus === 'PENDING_PAYMENT';
  }

  openPayModal(): void {
    this.selectedPayMethod = 'PAYPAL';
    this.showPayModal = true;
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.selectedPayMethod = 'PAYPAL';
  }

  confirmPay(): void {
    if (!this.order) return;
    this.isPaying = true;
    this.paymentService.processPayment({
      orderId: this.order.id,
      paymentMethod: this.selectedPayMethod as 'PAYPAL' | 'CREDIT_CARD' | 'BANK_TRANSFER'
    }).subscribe({
      next: () => {
        this.isPaying = false;
        this.closePayModal();
        this.loadOrder(this.order!.id);
      },
      error: (error) => {
        this.isPaying = false;
        this.errorMessage = error?.error?.message || 'Payment failed. Please try again.';
        console.error('Payment error:', error);
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  confirmCancel(): void {
    if (!this.order) return;
    this.isCancelling = true;
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.showCancelModal = false;
        this.loadOrder(this.order!.id);
      },
      error: (error) => {
        this.isCancelling = false;
        console.error('Error cancelling order:', error);
      }
    });
  }

  trackOrder(): void {
    if (this.order?.trackingCode) {
      this.router.navigate(['/orders/track', this.order.trackingCode]);
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getSubtotal(): number {
    return this.order?.subtotal || 0;
  }

  getShipping(): number {
    return this.order?.shippingCost || 0;
  }

  getTotal(): number {
    return this.order?.totalPrice || 0;
  }
}