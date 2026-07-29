import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { CartService } from '../../../../core/services/api/cart.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';
import { TokenService } from '../../../../core/services/token.service';
import { CategoryService } from '../../../../core/services/api/category.service';
import { Category } from '../../../../core/models/category.model';
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
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

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
    private cdr: ChangeDetectorRef,
    private authModalService: AuthModalService,
    private tokenService: TokenService,
    private categoryService: CategoryService
  ) {}

  // FIX: getter instead of a getCurrentSort() method call in the template.
  // Still recalculated each cycle, but no longer allocates a new object/array,
  // so it doesn't trigger the mat-option destroy/recreate cascade.
  get currentSort(): string {
    const { sortBy, sortDirection } = this.filterForm.value;
    return `${sortBy}_${sortDirection}`;
  }

  loadCategories(): void {
    this.categoryService.getActiveRootCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.categoryId = categoryId;
    this.currentPage = 0;
    this.loadProducts();
  }

  onSearch(keyword: string): void {
    // Trim keyword for consistent search quality
    const trimmed = (keyword || '').trim();
    this.filterForm.patchValue({ keyword: trimmed }, { emitEvent: false });
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

    // Load categories for the filter dropdown
    this.loadCategories();

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

    // Subscribe to filter changes — small debounce (350ms) so that
    // typing in price inputs doesn't fire an API call per keystroke,
    // while click-based toggles/sort still feel nearly instant.
    const filterSub = this.filterForm.valueChanges
      .pipe(
        debounceTime(350),
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
    this.cdr.detectChanges();
    console.error('Error loading products:', error);
  }

  loadProducts(): void {
    // Keep previous products visible during reload for a smoother UX.
    this.isLoading = true;
    this.errorMessage = '';

    const filters = this.filterForm?.value;

    // Trim keyword early so all branches can use it
    const keyword = filters?.keyword?.trim() || undefined;

    // If category is selected without additional filters, use the simple category endpoint
    const hasPriceFilter = filters?.minPrice || filters?.maxPrice;
    const hasToggleFilter = filters?.inStock === true || filters?.onSale === true;
    if (this.categoryId && !keyword && !hasPriceFilter && !hasToggleFilter) {
      this.productService.getActiveProductsByCategory(this.categoryId, this.currentPage, this.pageSize).pipe(
        finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
      ).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: (error) => this.handleProductsError(error, 'Failed to load products')
      });
      return;
    }

    // If keyword search, use search endpoint
    if (keyword) {
      this.productService.searchProducts(keyword, this.currentPage, this.pageSize).pipe(
        finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
      ).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: (error) => this.handleProductsError(error, 'Failed to search products')
      });
      return;
    }

    // Otherwise, use advanced search
    // Price range: only send if min <= max, and parse properly
    // Note: 0 is a valid price (free products), so check explicitly for non-empty
    const rawMin = filters?.minPrice !== '' && filters?.minPrice != null ? parseFloat(filters.minPrice) : undefined;
    const rawMax = filters?.maxPrice !== '' && filters?.maxPrice != null ? parseFloat(filters.maxPrice) : undefined;
    let minPrice = rawMin;
    let maxPrice = rawMax;
    if (rawMin !== undefined && rawMax !== undefined && rawMin > rawMax) {
      // Swap if inverted so the API always receives a valid range
      minPrice = rawMax;
      maxPrice = rawMin;
    }

    const searchRequest = {
      categoryId: this.categoryId || undefined,
      keyword,
      minPrice,
      maxPrice,
      inStock: filters?.inStock ?? null,
      onSale: filters?.onSale ?? null,
      sortBy: filters?.sortBy || 'createdAt',
      sortDirection: filters?.sortDirection || 'DESC',
      page: this.currentPage,
      size: this.pageSize
    };

    this.productService.advancedSearch(searchRequest).pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
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
    if (!this.tokenService.isAuthenticated()) {
      this.authModalService.open('login').subscribe(result => {
        if (result?.success) {
          // After successful login, proceed to add to cart, then reload to apply auth state
          this.cartService.addToCart({ productId, quantity: 1 }).subscribe({
            next: () => {
              console.log('Product added to cart');
              window.location.reload();
            },
            error: (error) => {
              console.error('Error adding to cart:', error);
              window.location.reload();
            }
          });
        }
      });
      return;
    }

    this.cartService.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => {
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
    this.selectedCategoryId = null;
    this.categoryId = null;
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