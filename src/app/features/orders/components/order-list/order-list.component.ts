import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order.service';
import { OrderSummary } from '../../../../core/models/order.model';
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

  filtersExpanded = true;
  cancelOrderToConfirm: OrderSummary | null = null;
  isCancelling = false;

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

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.pageSize));
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const status = this.filterForm.get('status')?.value;

    const obs$ = status
      ? this.orderService.getMyOrdersByStatus(status, this.currentPage, this.pageSize)
      : this.orderService.getMyOrders(this.currentPage, this.pageSize);

    obs$.subscribe({
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

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(trackingCode: string): void {
    this.router.navigate(['/orders/track', trackingCode]);
  }

  openCancelConfirm(order: OrderSummary): void {
    this.cancelOrderToConfirm = order;
  }

  confirmCancel(): void {
    if (!this.cancelOrderToConfirm) return;
    this.isCancelling = true;
    this.orderService.cancelOrder(this.cancelOrderToConfirm.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.cancelOrderToConfirm = null;
        this.loadOrders();
      },
      error: (error) => {
        this.isCancelling = false;
        this.errorMessage = error?.error?.message || 'Failed to cancel order';
        console.error('Error cancelling order:', error);
      }
    });
  }

  hasActiveFilter(): boolean {
    return !!this.filterForm.get('status')?.value || !!this.filterForm.get('search')?.value;
  }

  clearFilters(): void {
    this.filterForm.patchValue({ status: '', search: '' });
  }

  canCancel(status: string | OrderStatus): boolean {
    const s = typeof status === 'string' ? status : status;
    return s === 'PENDING_PAYMENT' || s === 'PAID' || s === 'READY_FOR_SHIPPING';
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
}