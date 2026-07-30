import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, finalize } from 'rxjs/operators';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { AuthService } from '../../../core/services/api/auth.service';
import { CartService } from '../../../core/services/api/cart.service';
import { ProductService } from '../../../core/services/api/product.service';
import { CategoryService } from '../../../core/services/api/category.service';
import { TokenService } from '../../../core/services/token.service';
import { UserProfile } from '../../../core/models/auth.model';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

interface SearchResult {
  products: Product[];
  categories: Category[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  user: UserProfile | null = null;
  isMenuOpen = false;
  isUserMenuOpen = false;
  isNavMenuOpen = false;
  currentTheme: 'dark' | 'light' = 'dark';

  // Search
  searchQuery = '';
  isSearchOpen = false;
  searchResults: SearchResult = { products: [], categories: [] };
  isSearching = false;
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  // FIX: expose the stream directly and bind it with `| async` in the template
  // instead of manually subscribing and assigning `this.cartItemCount = count`.
  // A manual assignment only repaints once Angular's zone happens to run a
  // change-detection tick — if the HTTP response resolves outside the zone
  // (e.g. with the fetch-based HttpClient backend), the badge can go stale
  // until an unrelated event (like a hover) forces a tick. The async pipe
  // calls markForCheck() itself whenever a new value arrives, so it always
  // repaints immediately regardless of zone timing.
  cartItemCount$: Observable<number>;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService,
    private cartService: CartService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.cartItemCount$ = this.cartService.cartItemCount$;
  }

  ngOnInit(): void {
    this.currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'light';
    this.checkAuthStatus();

    if (this.isAuthenticated) {
      this.cartService.refreshCartCount();
    }

    this.subscribeToAuthChanges();
    this.initSearch();

    // Reactively update user data when it changes (e.g., avatar upload, login, register)
    this.subscriptions.push(
      this.tokenService.userData$.subscribe(user => {
        if (user) {
          this.user = user;
          this.isAuthenticated = true; // Immediately reflect auth state in the UI
          this.avatarImgError = false; // Reset avatar error so new images are retried
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.searchSub?.unsubscribe();
  }

  // ========== SEARCH ==========

  private initSearch(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      filter(query => query.trim().length > 0),
      switchMap(query => {
        this.isSearching = true;
        return forkJoin({
          products: this.productService.searchProducts(query, 0, 5),
          categories: this.categoryService.searchCategories(query)
        }).pipe(
          finalize(() => this.isSearching = false)
        );
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = {
          products: (results.products as any)?.content || [],
          categories: (results.categories as any) || []
        };
      },
      error: () => {
        this.searchResults = { products: [], categories: [] };
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
    this.isSearchOpen = true;
  }

  onSearchFocus(): void {
    this.isSearchOpen = true;
  }

  closeSearch(): void {
    setTimeout(() => {
      this.isSearchOpen = false;
    }, 200);
  }

  submitSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
      this.isSearchOpen = false;
    }
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  goToCategory(id: number): void {
    this.router.navigate(['/products/category', id]);
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  goToSearchResults(): void {
    this.submitSearch();
  }

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.tokenService.isAuthenticated();
    if (this.isAuthenticated) {
      this.user = this.tokenService.getUserData();
    }
  }

  // ========== AUTH ==========

  subscribeToAuthChanges(): void {
    const navSub = this.router.events.subscribe(() => {
      const wasAuthenticated = this.isAuthenticated;
      this.checkAuthStatus();

      if (this.isAuthenticated !== wasAuthenticated) {
        if (this.isAuthenticated) {
          this.cartService.refreshCartCount();
        } else {
          this.cartService.resetCartCount();
        }
      }
    });
    this.subscriptions.push(navSub);
  }

  openAuthModal(mode: 'login' | 'register' = 'login'): void {
    this.authModalService.open(mode).subscribe(result => {
      if (result?.success) {
        // Redirect MANAGER/ADMIN users to admin dashboard
        const role = this.tokenService.getUserRole();
        if (role === 'MANAGER' || role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.reload();
        }
      }
    });
    this.closeMenu();
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.user = null;
        this.cartService.resetCartCount();
        // Full page reload to ensure all components reinitialize without auth
        window.location.href = '/';
      },
      error: () => {
        this.tokenService.clearAll();
        this.isAuthenticated = false;
        this.user = null;
        this.cartService.resetCartCount();
        // Full page reload to ensure all components reinitialize without auth
        window.location.href = '/';
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  // ========== UI ==========

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleNavMenu(): void {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNavMenu(): void {
    this.isNavMenuOpen = false;
  }

  avatarImgError = false;

  getInitials(): string {
    if (!this.user) return '';
    const first = this.user.firstName?.[0] || '';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || this.user.username[0].toUpperCase();
  }

  onAvatarImgError(): void {
    this.avatarImgError = true;
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'MANAGER';
  }
}