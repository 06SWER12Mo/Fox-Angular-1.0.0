import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../core/services/api/cart.service';

@Component({
  selector: 'app-floating-cart',
  templateUrl: './floating-cart.component.html',
  styleUrls: ['./floating-cart.component.scss'],
  standalone: false
})
export class FloatingCartComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  justIncreased = false;
  isVisible = false;

  private previousCount = 0;
  private sub!: Subscription;
  private routeSub!: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Track cart count
    this.sub = this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;

      if (count > this.previousCount) {
        this.justIncreased = true;
        setTimeout(() => {
          this.justIncreased = false;
        }, 500);
      }

      this.previousCount = count;
    });

    // Track route changes to show/hide widget
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.isVisible = this.shouldShowOnCurrentRoute();
    });

    // Check on init
    this.isVisible = this.shouldShowOnCurrentRoute();
  }

  private shouldShowOnCurrentRoute(): boolean {
    const url = this.router.url;
    // Parse the path without query params to check the base route
    const path = url.split('?')[0];

    // Show on home, products list/search/category, and categories list
    // NOT on product detail (/products/123), cart, checkout, orders, etc.
    if (path === '/') return true;
    if (path.startsWith('/categories')) return true;
    if (path === '/products') return true;
    if (path.startsWith('/products/search')) return true;
    if (path.startsWith('/products/category/')) return true;

    return false;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
