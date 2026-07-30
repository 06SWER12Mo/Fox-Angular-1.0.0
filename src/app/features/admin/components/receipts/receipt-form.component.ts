import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReceiptService } from '../../../../core/services/api/receipt.service';
import { ProductService } from '../../../../core/services/api/product.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-receipt-form',
  templateUrl: './receipt-form.component.html',
  styleUrls: ['../products/product-list.component.scss', './receipt-form.component.scss'],
  standalone: false
})
export class ReceiptFormComponent implements OnInit {
  receiptForm!: FormGroup;
  isSaving = false;
  suppliers: any[] = [];
  products: any[] = [];
  searchSubjects: Subject<string>[] = [];
  productResults: any[][] = [];
  showProductDropdown: boolean[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private receiptService: ReceiptService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.receiptForm = this.fb.group({
      supplierId: [null, Validators.required],
      receiptDate: [this.todayISO()],
      receiptType: ['PURCHASE'],
      paymentMethod: [''],
      notes: [''],
      shippingCost: [0],
      discountAmount: [0],
      items: this.fb.array([this.createItemForm()])
    });

    this.loadSuppliers();
    this.initItemSearch(0);
  }

  get items(): FormArray {
    return this.receiptForm.get('items') as FormArray;
  }

  private todayISO(): string {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  private createItemForm(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      productName: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      discountPercent: [0],
      taxPercent: [0],
      notes: ['']
    });
  }

  loadSuppliers(): void {
    this.receiptService.getAllSuppliers(0, 200).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.suppliers = Array.isArray(data) ? data : data?.content || [];
      },
      error: () => this.suppliers = []
    });
  }

  addItem(): void {
    const idx = this.items.length;
    this.items.push(this.createItemForm());
    this.initItemSearch(idx);
    this.cdr.detectChanges();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.searchSubjects.splice(index, 1);
      this.productResults.splice(index, 1);
      this.showProductDropdown.splice(index, 1);
    }
  }

  private initItemSearch(index: number): void {
    this.productResults[index] = [];
    this.showProductDropdown[index] = false;
    const subj = new Subject<string>();
    this.searchSubjects[index] = subj;

    subj.pipe(debounceTime(300), distinctUntilChanged()).subscribe({
      next: (keyword) => {
        if (!keyword || keyword.length < 1) {
          this.productResults[index] = [];
          this.showProductDropdown[index] = false;
          return;
        }
        this.productService.searchProducts(keyword, 0, 10).subscribe({
          next: (res: any) => {
            this.productResults[index] = res?.content || [];
            this.showProductDropdown[index] = this.productResults[index].length > 0;
            this.cdr.detectChanges();
          },
          error: () => {
            this.productResults[index] = [];
            this.showProductDropdown[index] = false;
          }
        });
      }
    });
  }

  onSearchProduct(index: number, keyword: string): void {
    this.searchSubjects[index]?.next(keyword);
  }

  selectProduct(index: number, product: any): void {
    const group = this.items.at(index) as FormGroup;
    group.patchValue({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price || 0
    });
    this.showProductDropdown[index] = false;
    this.productResults[index] = [];
  }

  onProductInputBlur(index: number): void {
    setTimeout(() => {
      this.showProductDropdown[index] = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onProductInputFocus(index: number): void {
    const val = this.items.at(index)?.get('productName')?.value;
    if (val && val.length > 0) {
      this.onSearchProduct(index, val);
    }
  }

  getItemTotal(index: number): number {
    const group = this.items.at(index);
    if (!group) return 0;
    const qty = group.get('quantity')?.value || 0;
    const price = group.get('unitPrice')?.value || 0;
    const discPct = group.get('discountPercent')?.value || 0;
    const taxPct = group.get('taxPercent')?.value || 0;
    const subtotal = qty * price;
    const discount = subtotal * (discPct / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (taxPct / 100);
    return afterDiscount + tax;
  }

  get subtotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemTotal(i);
    }
    return total;
  }

  get shippingCost(): number {
    return this.receiptForm.get('shippingCost')?.value || 0;
  }

  get discountAmount(): number {
    return this.receiptForm.get('discountAmount')?.value || 0;
  }

  get grandTotal(): number {
    return this.subtotal + this.shippingCost - this.discountAmount;
  }

  save(): void {
    if (this.receiptForm.invalid) return;

    this.isSaving = true;
    const formVal = this.receiptForm.value;

    const request = {
      supplierId: formVal.supplierId,
      receiptDate: formVal.receiptDate ? new Date(formVal.receiptDate).toISOString() : undefined,
      receiptType: formVal.receiptType || 'PURCHASE',
      paymentMethod: formVal.paymentMethod || undefined,
      notes: formVal.notes || undefined,
      shippingCost: formVal.shippingCost || 0,
      discountAmount: formVal.discountAmount || 0,
      items: formVal.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
        taxPercent: item.taxPercent || 0,
        notes: item.notes || undefined
      }))
    };

    this.receiptService.createReceipt(request).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/admin/receipts']);
      },
      error: (err: any) => {
        console.error('Receipt creation failed:', err);
        alert('Failed to create receipt. Please check the data and try again.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/receipts']);
  }
}
