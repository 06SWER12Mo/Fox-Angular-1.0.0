import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order.service';
import { Order } from '../../../../core/models/order.model';
import { OrderStatus } from '../../../../core/models/enums.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
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
    this.orderService.getOrderById(id).subscribe({
      next: (response: any) => {
        this.order = response?.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
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

  cancelOrder(): void {
    if (!this.order) return;
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: () => {
          this.loadOrder(this.order!.id);
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        }
      });
    }
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