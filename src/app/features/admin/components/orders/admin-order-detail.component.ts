import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order.service';
import { UpdateOrderStatusRequest } from '../../../../core/models/order.model';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
  standalone: false
})
export class AdminOrderDetailComponent implements OnInit {
  order: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  orderId: number | null = null;

  statusFlow = ['PENDING_PAYMENT', 'PAID', 'READY_FOR_SHIPPING', 'ASSIGNED_TO_BATCH', 'SHIPPED', 'DELIVERED'];
  availableStatuses: string[] = [];
  isUpdatingStatus = false;
  showStatusMenu = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.orderId = +params['id'];
        this.loadOrder(this.orderId);
      }
    });
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        this.updateAvailableStatuses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Order Detail] Failed to load order:', err);
        this.order = null;
        this.isLoading = false;

        if (err.status === 403) {
          this.errorMessage = 'You do not have permission to view this order.';
        } else if (err.status === 404) {
          this.errorMessage = 'Order not found.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to load order.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  getStatusIndex(): number {
    return this.statusFlow.indexOf(this.order?.orderStatus);
  }

  private updateAvailableStatuses(): void {
    const idx = this.getStatusIndex();
    if (idx < 0 || idx >= this.statusFlow.length - 1) {
      this.availableStatuses = [];
      return;
    }
    // Show all statuses ahead of the current one
    this.availableStatuses = this.statusFlow.slice(idx + 1);
  }

  toggleStatusMenu(): void {
    this.showStatusMenu = !this.showStatusMenu;
  }

  closeStatusMenu(): void {
    this.showStatusMenu = false;
  }

  changeStatus(status: string): void {
    this.showStatusMenu = false;
    if (!confirm(`Change order status to "${this.formatStatus(status)}"?`)) return;
    this.isUpdatingStatus = true;
    const req: UpdateOrderStatusRequest = { orderStatus: status };
    this.orderService.updateOrderStatus(this.order.id, req).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.loadOrder(this.order.id);
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        alert(err.error?.message || 'Failed to update status');
      }
    });
  }

  cancelOrder(): void {
    if (!confirm('Cancel this order?')) return;
    const req: UpdateOrderStatusRequest = { orderStatus: 'CANCELLED' };
    this.orderService.updateOrderStatus(this.order.id, req).subscribe({
      next: () => this.loadOrder(this.order.id)
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }
}
