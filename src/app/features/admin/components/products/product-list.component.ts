import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: false
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  isLoading = true;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  sortBy = 'createdAt';
  sortDir = 'desc';

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.loadProducts());
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  loadProducts(): void {
    this.isLoading = true;
    const obs = this.searchQuery
      ? this.productService.searchProducts(this.searchQuery, this.currentPage, this.pageSize)
      : this.productService.getAllProducts(this.currentPage, this.pageSize);

    obs.pipe(finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })).subscribe({
      next: (res: any) => {
        this.products = res?.content || res || [];
        this.totalPages = res?.totalPages || 1;
        this.totalElements = res?.totalElements || this.products.length;
      },
      error: () => this.products = []
    });
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  editProduct(id: number): void {
    this.router.navigate(['/admin/products', id, 'edit']);
  }

  toggleStatus(product: any): void {
    // Implementation in real app would call productService.toggleProductActive(id)
    product.active = !product.active;
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Failed to delete product')
    });
  }
}
