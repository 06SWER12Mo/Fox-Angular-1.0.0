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
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;

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

  clearFilter(): void {
    this.selectedSupplierId = null;
    this.currentPage = 0;
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.isLoading = true;
    let obs;
    if (this.selectedSupplierId) {
      obs = this.receiptService.getReceiptsBySupplier(this.selectedSupplierId, this.currentPage, this.pageSize);
    } else {
      obs = this.receiptService.getAllReceipts(this.currentPage, this.pageSize);
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

  printReceipt(receipt: any): void {
    window.open(`/admin/receipts/${receipt.id}/print`, '_blank');
  }
}
