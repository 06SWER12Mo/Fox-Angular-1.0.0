import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus, PaymentStatus, ShippingStatus } from '../../core/models/enums.model';

@Pipe({
  name: 'statusColor',
  standalone: false
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const colors: Record<string, string> = {
      // Order statuses
      'PENDING_PAYMENT': 'warning',
      'PAID': 'primary',
      'READY_FOR_SHIPPING': 'accent',
      'ASSIGNED_TO_BATCH': 'accent',
      'SHIPPED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger',
      
      // Payment statuses
      'PENDING': 'warning',
      'FAILED': 'danger',
      'REFUNDED': 'info',
      
      // Shipping statuses
      'COLLECTING_ORDERS': 'warning',
      'READY_TO_DISPATCH': 'accent',
      'DISPATCHED': 'primary'
    };
    
    return colors[status] || 'default';
  }
}