import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/api/order.service';
import { TrackingResponse, TrackingEvent } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
  standalone: false
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  tracking: TrackingResponse | null = null;
  trackingForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';
  trackingCodeFromUrl: string | null = null;
  private destroyed = false;

  /** Ordered → Processing → Shipped → Delivered */
  private readonly milestones = [
    'PENDING_PAYMENT',
    'PAID',
    'SHIPPED',
    'DELIVERED'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['trackingCode']) {
        this.trackingCodeFromUrl = params['trackingCode'];
        this.trackingForm.patchValue({ trackingCode: params['trackingCode'] });
        this.trackOrder(params['trackingCode']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  initForm(): void {
    this.trackingForm = this.fb.group({
      trackingCode: ['', [Validators.required]]
    });
  }

  trackOrder(trackingCode?: string): void {
    const code = (trackingCode || this.trackingForm.get('trackingCode')?.value || '').trim();
    if (!code) {
      this.submitted = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.tracking = null;

    // Force change detection the moment the response arrives so the result
    // renders immediately (previously it only appeared after clicking elsewhere).
    this.orderService.getTrackingDetails(code).subscribe({
      next: (response: any) => {
        if (this.destroyed) return;
        this.tracking = response?.data || response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (this.destroyed) return;
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Tracking code not found';
        this.cdr.detectChanges();
        console.error('Error tracking order:', error);
      }
    });
  }

  resetTracking(): void {
    this.tracking = null;
    this.errorMessage = '';
    this.submitted = false;
    this.trackingForm.reset();
  }

  /** History sorted oldest → newest for a chronological timeline. */
  get sortedHistory(): TrackingEvent[] {
    if (!this.tracking?.trackingHistory?.length) return [];
    return [...this.tracking.trackingHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  get isCancelled(): boolean {
    return this.tracking?.currentStatus === 'CANCELLED';
  }

  /** 0–3 progress across the delivery milestones. */
  getProgressIndex(): number {
    const status = this.tracking?.currentStatus || '';
    const idx = this.milestones.indexOf(status);
    if (idx >= 0) return idx;
    // Intermediate states map to the milestone they're moving towards.
    switch (status) {
      case 'READY_FOR_SHIPPING': return 1;
      case 'ASSIGNED_TO_BATCH': return 2;
      default: return 0;
    }
  }

  getProgressPercent(): number {
    return Math.round((this.getProgressIndex() / (this.milestones.length - 1)) * 100);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING_PAYMENT': 'Pending Payment',
      'PAID': 'Paid',
      'READY_FOR_SHIPPING': 'Ready for Shipping',
      'ASSIGNED_TO_BATCH': 'Assigned to Batch',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING_PAYMENT': 'var(--color-warning, #ecc94b)',
      'PAID': 'var(--color-success, #48bb78)',
      'READY_FOR_SHIPPING': 'var(--color-info, #4299e1)',
      'ASSIGNED_TO_BATCH': 'var(--color-info, #4299e1)',
      'SHIPPED': 'var(--color-info, #4299e1)',
      'DELIVERED': 'var(--color-success, #48bb78)',
      'CANCELLED': 'var(--color-danger, #e2596a)'
    };
    return colors[status] || 'var(--color-text-muted)';
  }

  /** Soft-tinted badge readable on both themes. */
  getStatusBadgeStyle(status: string): { [key: string]: string } {
    const colors: Record<string, string> = {
      'PENDING_PAYMENT': '#ecc94b',
      'PAID': '#48bb78',
      'READY_FOR_SHIPPING': '#4299e1',
      'ASSIGNED_TO_BATCH': '#4299e1',
      'SHIPPED': '#4299e1',
      'DELIVERED': '#48bb78',
      'CANCELLED': '#e2596a'
    };
    const c = colors[status] || '#a0aec0';
    return { color: c, 'background-color': `${c}1f`, 'border-color': `${c}4d` };
  }

  /** Inline SVG path for a status icon (feather-style stroke paths). */
  getStatusIconPath(status: string): string {
    const paths: Record<string, string> = {
      'PENDING_PAYMENT': 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      'PAID': 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      'READY_FOR_SHIPPING': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      'ASSIGNED_TO_BATCH': 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
      'SHIPPED': 'M5 17h14M5 17a2 2 0 1 1-2-2m2 2a2 2 0 1 0 2-2m-2 2V7h7v8M14 9h4l3 3v3h-7M17 17a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0',
      'DELIVERED': 'M3 11l9-7 9 7M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M9 21v-6h6v6',
      'CANCELLED': 'M6 18L18 6M6 6l12 12'
    };
    return paths[status] || paths['SHIPPED'];
  }

  goToOrder(): void {
    if (this.tracking?.orderNumber) {
      this.router.navigate(['/orders']);
    }
  }
}