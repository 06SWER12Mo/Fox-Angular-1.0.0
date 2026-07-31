import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReceiptService } from '../../../../core/services/api/receipt.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['../products/product-list.component.scss', './receipt-list.component.scss'],
  standalone: false
})
export class ReceiptListComponent implements OnInit {
  receipts: any[] = [];
  isLoading = true;
  suppliers: any[] = [];
  selectedSupplierId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;

  // View receipt modal
  showReceiptModal = false;
  selectedReceipt: any = null;
  receiptLoading = false;

  constructor(
    private receiptService: ReceiptService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadReceipts();
  }

  loadSuppliers(): void {
    this.receiptService.getAllSuppliers(0, 100).subscribe({
      next: (res: any) => {
        const content = res?.content || res?.data?.content || res || [];
        this.suppliers = Array.isArray(content) ? content : [];
      },
      error: () => this.suppliers = []
    });
  }

  onSupplierFilter(): void {
    this.currentPage = 0;
    this.loadReceipts();
  }

  onDateFilter(): void {
    this.currentPage = 0;
    this.loadReceipts();
  }

  clearFilter(): void {
    this.selectedSupplierId = null;
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.loadReceipts();
  }

  hasActiveFilters(): boolean {
    return !!this.selectedSupplierId || !!this.startDate || !!this.endDate;
  }

  private toIsoDateTime(dateStr: string, endOfDay: boolean): string | undefined {
    if (!dateStr) return undefined;
    return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
  }

  loadReceipts(): void {
    this.isLoading = true;
    const start = this.toIsoDateTime(this.startDate, false);
    const end = this.toIsoDateTime(this.endDate, true);
    let obs;
    if (this.selectedSupplierId) {
      obs = this.receiptService.getReceiptsBySupplier(this.selectedSupplierId, this.currentPage, this.pageSize, start, end);
    } else {
      obs = this.receiptService.getAllReceipts(this.currentPage, this.pageSize, start, end);
    }
    obs.pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const content = data?.content || data || [];
        this.receipts = Array.isArray(content) ? content : [];
        this.totalPages = data?.totalPages || 0;
      },
      error: () => {
        this.receipts = [];
        this.totalPages = 0;
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadReceipts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadReceipts();
    }
  }

  viewReceipt(receipt: any): void {
    this.selectedReceipt = receipt;
    this.showReceiptModal = true;
    this.receiptLoading = true;
    // Load the full receipt (with items) for the bill view
    this.receiptService.getReceiptById(receipt.id).subscribe({
      next: (res: any) => {
        this.selectedReceipt = res?.data || res || receipt;
        this.receiptLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.receiptLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeReceiptModal(): void {
    this.showReceiptModal = false;
    this.selectedReceipt = null;
  }
}
