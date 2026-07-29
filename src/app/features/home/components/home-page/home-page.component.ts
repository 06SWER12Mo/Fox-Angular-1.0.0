import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HomeService } from '../../services/home.service';
import { HomePageData, ProductSummary } from '../../models/home.model';
import { Category } from '../../../../core/models/category.model';
import { CartService } from '../../../../core/services/api/cart.service';
import { TokenService } from '../../../../core/services/token.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';
import { AuthModalMode } from '../../../../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: false
})
export class HomePageComponent implements OnInit, OnDestroy {
  data: HomePageData | null = null;
  isLoading = true;
  searchQuery = '';
  currentSlide = 0;
  Math = Math;
  private subscriptions: Subscription[] = [];
  private slideInterval: any;

  // Stats to animate
  animatedStats = { totalProducts: 0, totalCategories: 0, totalOrders: 0, happyCustomers: 0 };

  isAuthenticated = false;

  constructor(
    private homeService: HomeService,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private authModalService: AuthModalService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.tokenService.isAuthenticated();
    this.loadHomePage();
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  loadHomePage(): void {
    this.isLoading = true;
    const sub = this.homeService.getHomePageData().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.data = data;
        this.animatedStats = { ...data.stats }; // Set immediately — right from the beginning
        this.cdr.detectChanges();
      },
      error: () => {
        // finalize handles isLoading = false
      }
    });
    this.subscriptions.push(sub);
  }



  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
    }, 5000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
    }
  }

  onCategoryClick(categoryId: number): void {
    this.router.navigate(['/products/category', categoryId]);
  }

  openAuthModal(mode: AuthModalMode = 'login'): void {
    this.authModalService.open(mode).subscribe(result => {
      if (result?.success) {
        // Full page reload to ensure all components reinitialize with auth state
        window.location.reload();
      }
    });
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
      next: () => console.log('Product added to cart'),
      error: (error) => console.error('Error adding to cart:', error)
    });
  }

  trackByProductId(index: number, product: ProductSummary): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder-category.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  getDiscountedPrice(product: ProductSummary): number | null {
    return product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : null;
  }

  hasDiscount(product: ProductSummary): boolean {
    return product.discountPercentage > 0;
  }
}
