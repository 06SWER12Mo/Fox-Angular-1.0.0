import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReceiptService } from '../../../../core/services/api/receipt.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss'],
  standalone: false
})
export class SupplierListComponent implements OnInit {
  suppliers: any[] = [];
  isLoading = true;
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  searchQuery = '';

  showModal = false;
  isSaving = false;
  editMode = false;
  form: any = {};

  constructor(
    private receiptService: ReceiptService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    const obs: any = this.searchQuery.trim()
      ? this.receiptService.searchSuppliers(this.searchQuery.trim())
      : this.receiptService.getAllSuppliers(this.currentPage, this.pageSize);

    obs.pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        if (Array.isArray(data)) {
          this.suppliers = data;
          this.totalPages = 1;
        } else {
          const content = data?.content || data || [];
          this.suppliers = Array.isArray(content) ? content : [];
          this.totalPages = data?.totalPages || 0;
        }
      },
      error: () => {
        this.suppliers = [];
        this.totalPages = 0;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadSuppliers();
  }

  openAddModal(): void {
    this.editMode = false;
    this.form = {
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      taxId: '',
      registrationNumber: '',
      notes: '',
      paymentTerms: '',
      deliveryTerms: ''
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(supplier: any): void {
    this.editMode = true;
    this.form = { ...supplier };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveSupplier(): void {
    if (!this.form.name || !this.form.code) return;

    this.isSaving = true;
    const request = { ...this.form };
    delete request.id;
    delete request.receiptCount;
    delete request.fullAddress;
    delete request.createdAt;
    delete request.updatedAt;
    delete request.active;

    const obs = this.editMode
      ? this.receiptService.updateSupplier(this.form.id, request)
      : this.receiptService.createSupplier(request);

    obs.pipe(
      finalize(() => { this.isSaving = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.closeModal();
        this.loadSuppliers();
      },
      error: (err: any) => {
        console.error('Supplier save error:', err);
      }
    });
  }

  toggleActive(supplier: any): void {
    this.receiptService.toggleSupplierActive(supplier.id).subscribe({
      next: () => this.loadSuppliers(),
      error: (err: any) => console.error(err)
    });
  }

  deleteSupplier(supplier: any): void {
    if (!confirm(`Delete supplier "${supplier.name}"? This action cannot be undone.`)) return;
    this.receiptService.deleteSupplier(supplier.id).subscribe({
      next: () => this.loadSuppliers(),
      error: (err: any) => console.error(err)
    });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSuppliers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSuppliers();
    }
  }
}
