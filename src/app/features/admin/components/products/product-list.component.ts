import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { CategoryService } from '../../../../core/services/api/category.service';
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
  categories: any[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategoryId: number | null = null;
  private searchSubject = new Subject<string>();
  private requestId = 0;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  sortBy = 'createdAt';
  sortDir = 'desc';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.loadProducts());
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(0, 500).subscribe({
      next: (res: any) => this.categories = Array.isArray(res) ? res : res?.content || [],
      error: () => this.categories = []
    });
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  loadProducts(): void {
    this.isLoading = true;
    const requestId = ++this.requestId;
    let obs: any;

    if (this.selectedCategoryId && this.searchQuery) {
      obs = this.productService.advancedSearch({
        keyword: this.searchQuery,
        categoryId: this.selectedCategoryId,
        page: this.currentPage,
        size: this.pageSize
      });
    } else if (this.selectedCategoryId) {
      obs = this.productService.getProductsByCategory(this.selectedCategoryId, this.currentPage, this.pageSize);
    } else if (this.searchQuery) {
      obs = this.productService.searchProducts(this.searchQuery, this.currentPage, this.pageSize);
    } else {
      obs = this.productService.getAllProducts(this.currentPage, this.pageSize);
    }

    obs.pipe(finalize(() => {
      if (requestId === this.requestId) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })).subscribe({
      next: (res: any) => {
        // Ignore stale responses from an earlier filter change
        if (requestId !== this.requestId) return;
        this.products = res?.content || res || [];
        this.totalPages = res?.totalPages || 1;
        this.totalElements = res?.totalElements || this.products.length;
      },
      error: () => { if (requestId === this.requestId) this.products = []; }
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

  viewProduct(id: number): void {
    this.router.navigate(['/admin/products', id]);
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
