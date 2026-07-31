import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-order-list',
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss'],
  standalone: false
})
export class AdminOrderListComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  currentPage = 0;
  totalPages = 0;
  pageSize = 20;

  statusFilter = '';
  dateFrom = '';
  dateTo = '';
  searchQuery = '';

  statuses = ['', 'PENDING_PAYMENT', 'READY_FOR_SHIPPING', 'ASSIGNED_TO_BATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    const obs: any = this.statusFilter
      ? this.orderService.getOrdersByStatus(this.statusFilter)
      : this.orderService.getAllOrders(this.currentPage, this.pageSize);

    obs.pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        if (this.statusFilter) {
          this.orders = Array.isArray(res) ? res : [];
          this.totalPages = 1;
        } else {
          this.orders = res?.content || res || [];
          this.totalPages = res?.totalPages || 1;
        }
      },
      error: () => this.orders = []
    });
  }

  viewOrder(id: number): void {
    this.router.navigate(['/admin/orders', id]);
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.currentPage = 0;
    this.loadOrders();
  }
}
