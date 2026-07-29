import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { OrderService } from '../../../../core/services/api/order.service';
import { OrderSummary  } from '../../../../core/models/order.model';
import { OrderStatus } from '../../../../core/models/enums.model';
import { PageResponse } from '../../../../core/models/common.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  standalone: false
})
export class OrderListComponent implements OnInit {
  orders: OrderSummary[] = [];
  isLoading = true;
  errorMessage = '';
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  filterForm!: FormGroup;
  statusOptions = Object.values(OrderStatus);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadOrders();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [''],
      search: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    const status = this.filterForm.get('status')?.value;
    const search = this.filterForm.get('search')?.value;

    // If status filter is applied
    if (status) {
      this.orderService.getMyOrdersByStatus(status, this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          const page: PageResponse<OrderSummary> = response?.data || response;
          this.orders = page.content || [];
          this.totalElements = page.totalElements || 0;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to load orders';
          console.error('Error loading orders:', error);
        }
      });
    } else {
      this.orderService.getMyOrders(this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          const page: PageResponse<OrderSummary> = response?.data || response;
          this.orders = page.content || [];
          this.totalElements = page.totalElements || 0;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to load orders';
          console.error('Error loading orders:', error);
        }
      });
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(trackingCode: string): void {
    if (trackingCode) {
      this.router.navigate(['/orders/track', trackingCode]);
    }
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        }
      });
    }
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

  canCancel(status: string | OrderStatus): boolean {
  const statusStr = typeof status === 'string' ? status : status;
  return statusStr === 'PENDING_PAYMENT' || 
         statusStr === 'PAID' || 
         statusStr === 'READY_FOR_SHIPPING';
}
}