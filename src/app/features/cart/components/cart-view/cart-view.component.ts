import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { CartService } from '../../../../core/services/api/cart.service';
import { ProductService } from '../../../../core/services/api/product.service';
import { Cart } from '../../../../core/models/cart.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  standalone: false
})
export class CartViewComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cartService.getCart().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.cart = response?.data || response as any;
        // If cart items have no imageUrl, fetch product images directly
        this.enrichCartWithImages();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load cart';
        console.error('Error loading cart:', error);
      }
    });
  }

  /**
   * For cart items missing imageUrl, fetch product summaries to get primaryImageUrl.
   * This is a robust fallback that works whether or not the backend includes imageUrl.
   */
  private enrichCartWithImages(): void {
    if (!this.cart?.items?.length) return;
    
    const itemsNeedingImages = this.cart.items.filter(item => !item.imageUrl);
    if (itemsNeedingImages.length === 0) return;
    
    // Fetch product summaries for all items needing images
    // Each request catches errors individually so one failure doesn't kill all
    const imageFetches = itemsNeedingImages.map(item =>
      this.productService.getProductSummary(item.productId).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(imageFetches).subscribe({
      next: (summaries) => {
        summaries.forEach((summary, index) => {
          if (!summary) return;
          if (summary.primaryImageUrl) {
            const item = itemsNeedingImages[index];
            item.imageUrl = summary.primaryImageUrl;
          }
        });
        // New object + new array reference to ensure Angular change detection picks it up
        this.cart = { ...this.cart!, items: [...this.cart!.items] };
      },
      error: (err) => {
        console.warn('Failed to fetch product images for cart:', err);
      }
    });
  }

  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId);
      return;
    }

    this.isUpdating = true;
    this.cartService.updateCartItem({ productId, quantity: newQuantity }).pipe(
      finalize(() => this.isUpdating = false)
    ).subscribe({
      next: (response) => {
        this.cart = response?.data || response as any;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update cart';
        console.error('Error updating cart:', error);
      }
    });
  }

  removeItem(productId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Item',
        message: 'Are you sure you want to remove this item from your cart?',
        confirmText: 'Remove',
        cancelText: 'Keep',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.isUpdating = true;
      this.cartService.removeFromCart(productId).pipe(
        finalize(() => this.isUpdating = false)
      ).subscribe({
        next: (response) => {
          this.cart = response?.data || response as any;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to remove item';
          console.error('Error removing item:', error);
        }
      });
    });
  }

  clearCart(): void {
    if (!this.cart?.items?.length) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Clear Cart',
        message: 'Are you sure you want to remove all items from your cart?',
        confirmText: 'Clear All',
        cancelText: 'Cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.isUpdating = true;
      this.cartService.clearCart().pipe(
        finalize(() => this.isUpdating = false)
      ).subscribe({
        next: () => this.loadCart(),
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to clear cart';
          console.error('Error clearing cart:', error);
        }
      });
    });
  }

  proceedToCheckout(): void {
    if (this.cart?.items?.length) {
      this.router.navigate(['/checkout']);
    }
  }


  getTotalItems(): number {
    return this.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  isEmpty(): boolean {
    return !this.cart?.items?.length;
  }


}