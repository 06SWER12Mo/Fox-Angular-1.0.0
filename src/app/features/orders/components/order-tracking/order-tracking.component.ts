import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/api/order.service';
import { TrackingResponse } from '../../../../core/models/order.model';
import { TrackingStatus } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
  standalone:false
})
export class OrderTrackingComponent implements OnInit {
  tracking: TrackingResponse | null = null;
  trackingForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  trackingCodeFromUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private fb: FormBuilder
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

  initForm(): void {
    this.trackingForm = this.fb.group({
      trackingCode: ['', [Validators.required]]
    });
  }

  trackOrder(trackingCode?: string): void {
    const code = trackingCode || this.trackingForm.get('trackingCode')?.value;
    
    if (!code) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.tracking = null;

    this.orderService.getTrackingDetails(code).subscribe({
      next: (response: any) => {
        this.tracking = response?.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Tracking code not found';
        console.error('Error tracking order:', error);
      }
    });
  }

  // ✅ Fix: Accept string, return string
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

  // ✅ Fix: Accept string, return string
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'PENDING_PAYMENT': 'payment',
      'PAID': 'check_circle',
      'READY_FOR_SHIPPING': 'inventory',
      'ASSIGNED_TO_BATCH': 'assignment',
      'SHIPPED': 'local_shipping',
      'DELIVERED': 'home',
      'CANCELLED': 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING_PAYMENT': '#ecc94b',
      'PAID': '#48bb78',
      'READY_FOR_SHIPPING': '#4299e1',
      'ASSIGNED_TO_BATCH': '#4299e1',
      'SHIPPED': '#4299e1',
      'DELIVERED': '#48bb78',
      'CANCELLED': '#fc8181'
    };
    return colors[status] || '#a0aec0';
  }

  goToOrder(): void {
    if (this.tracking?.orderNumber) {
      this.router.navigate(['/orders']);
    }
  }
}