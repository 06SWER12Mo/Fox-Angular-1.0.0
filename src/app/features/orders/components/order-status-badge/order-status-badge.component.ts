import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-order-status-badge',
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss'],
  standalone:false
})
export class OrderStatusBadgeComponent {
  @Input() status!: OrderStatus | string;

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      'PENDING_PAYMENT': 'Pending Payment',
      'PAID': 'Paid',
      'READY_FOR_SHIPPING': 'Ready for Shipping',
      'ASSIGNED_TO_BATCH': 'Assigned to Batch',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return labels[this.status as string] || this.status as string;
  }

  getStatusColor(): string {
    const colors: Record<string, string> = {
      'PENDING_PAYMENT': '#ecc94b',
      'PAID': '#48bb78',
      'READY_FOR_SHIPPING': '#4299e1',
      'ASSIGNED_TO_BATCH': '#4299e1',
      'SHIPPED': '#4299e1',
      'DELIVERED': '#48bb78',
      'CANCELLED': '#fc8181'
    };
    return colors[this.status as string] || '#a0aec0';
  }

  getStatusIcon(): string {
    const icons: Record<string, string> = {
      'PENDING_PAYMENT': 'payment',
      'PAID': 'check_circle',
      'READY_FOR_SHIPPING': 'inventory',
      'ASSIGNED_TO_BATCH': 'assignment',
      'SHIPPED': 'local_shipping',
      'DELIVERED': 'home',
      'CANCELLED': 'cancel'
    };
    return icons[this.status as string] || 'help';
  }

  isDelivered(): boolean {
    return this.status === 'DELIVERED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }
}