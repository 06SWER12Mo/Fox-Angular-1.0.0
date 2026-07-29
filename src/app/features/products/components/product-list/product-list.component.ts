import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { CartService } from '../../../../core/services/api/cart.service';
import { Product } from '../../../../core/models/product.model';
import { PageResponse } from '../../../../core/models/common.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

/**
 * Compare two form value objects by JSON stringify to work around
 * reference-equality semantics of RxJS default `distinctUntilChanged`.
 */
function formValuesEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: false
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  categoryId: number | null = null;

  filterForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private routeParamsSub: Subscription | null = null;
  private queryParamsSub: Subscription | null = null;

  Math = Math;

  // FIX: stable field created once, instead of a getSortOptions() method
  // called (and returning a brand-new array) on every change detection cycle.
  sortOptions: { value: string; label: string }[] = [
    { value: 'createdAt_DESC', label: 'Newest' },
    { value: 'createdAt_ASC', label: 'Oldest' },
    { value: 'price_ASC', label: 'Price: Low to High' },
    { value: 'price_DESC', label: 'Price: High to Low' },
    { value: 'averageRating_DESC', label: 'Top Rated' },
    { value: 'soldCount_DESC', label: 'Best Selling' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // FIX: getter instead of a getCurrentSort() method call in the template.
  // Still recalculated each cycle, but no longer allocates a new object/array,
  // so it doesn't trigger the mat-option destroy/recreate cascade.
  get currentSort(): string {
    const { sortBy, sortDirection } = this.filterForm.value;
    return `${sortBy}_${sortDirection}`;
  }

  onSearch(keyword: string): void {
    // Patch the shared filter form so that the debounced valueChanges
    // subscription picks up the change — but don't emit here because
    // we'll call loadProducts() ourselves right now (no debounce).
    this.filterForm.patchValue({ keyword }, { emitEvent: false });
    this.currentPage = 0;
    this.loadProducts();
  }

  ngOnInit(): void {
    this.initFilterForm();

    // Capture initial route param values (category, etc.)
    const initialParams = this.route.snapshot.params;
    if (initialParams['categoryId']) {
      this.categoryId = +initialParams['categoryId'];
    } else {
      this.categoryId = null;
    }

    // Handle search from query params (initial load)
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['search']) {
      this.filterForm.patchValue({ keyword: queryParams['search'] }, { emitEvent: false });
    }

    // Kick off the very first product load right away.
    this.loadProducts();

    // Listen for subsequent route param changes (e.g. category navigation).
    this.routeParamsSub = this.route.params.subscribe(params => {
      const newCategoryId = params['categoryId'] ? +params['categoryId'] : null;
      if (newCategoryId !== this.categoryId) {
        this.categoryId = newCategoryId;
        this.currentPage = 0;
        this.loadProducts();
      }
    });

    // Listen for subsequent query param changes (e.g. search from elsewhere).
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.filterForm.patchValue({ keyword: params['search'] }, { emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.routeParamsSub?.unsubscribe();
    this.queryParamsSub?.unsubscribe();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      sortBy: ['createdAt'],
      sortDirection: ['DESC'],
      minPrice: [''],
      maxPrice: [''],
      inStock: [null],
      onSale: [null]
    });

    // Subscribe to filter changes — debounced to avoid rapid-fire API calls.
    // distinctUntilChanged with a deep-comparator prevents reloading when the
    // form is patched back to the same values it already has.
    const filterSub = this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(formValuesEqual)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadProducts();
      });

    this.subscriptions.push(filterSub);
  }

  /**
   * Handle the API response or error for any product-fetching call.
   * Extracted into one place so all three branches share the same logic.
   */
  private handleProductsResponse(response: any): void {
    // The backend returns Spring Page JSON directly (not wrapped in ApiResponse).
    // Spring Page has 'content' at the top level.
    const page = response || { content: [], totalElements: 0 };
    this.products = page.content || [];
    this.totalElements = page.totalElements || 0;
    this.cdr.detectChanges();
  }

  private handleProductsError(error: any, fallbackMessage: string): void {
    this.isLoading = false;
    this.errorMessage = error?.error?.message || fallbackMessage;
    console.error('Error loading products:', error);
  }

  loadProducts(): void {
    // Keep previous products visible during reload for a smoother UX.
    this.isLoading = true;
    this.errorMessage = '';

    const filters = this.filterForm?.value;

    // If category is selected, use category endpoint
    if (this.categoryId) {
      this.productService.getActiveProductsByCategory(this.categoryId, this.currentPage, this.pageSize).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: (error) => this.handleProductsError(error, 'Failed to load products')
      });
      return;
    }

    // If keyword search, use search endpoint
    if (filters?.keyword?.trim()) {
      this.productService.searchProducts(filters.keyword, this.currentPage, this.pageSize).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: (error) => this.handleProductsError(error, 'Failed to search products')
      });
      return;
    }

    // Otherwise, use advanced search
    const searchRequest = {
      categoryId: this.categoryId || undefined,
      keyword: filters?.keyword || undefined,
      minPrice: filters?.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters?.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      inStock: filters?.inStock ?? null,
      onSale: filters?.onSale ?? null,
      sortBy: filters?.sortBy || 'createdAt',
      sortDirection: filters?.sortDirection || 'DESC',
      page: this.currentPage,
      size: this.pageSize
    };

    this.productService.advancedSearch(searchRequest).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => this.handleProductsResponse(response),
      error: (error) => this.handleProductsError(error, 'Failed to load products')
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  addToCart(productId: number): void {
    this.cartService.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => {
        // Show success notification (you can add a toast service)
        console.log('Product added to cart');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      inStock: null,
      onSale: null,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    }, { emitEvent: false });
    this.currentPage = 0;
    this.loadProducts();
  }

  onSortChange(sort: string): void {
    const [sortBy, sortDirection] = sort.split('_');
    // Update the form silently so the valueChanges subscription stays in sync
    // but we trigger the load ourselves without a 500 ms debounce delay.
    this.filterForm.patchValue({ sortBy, sortDirection }, { emitEvent: false });
    this.currentPage = 0;
    this.loadProducts();
  }
}