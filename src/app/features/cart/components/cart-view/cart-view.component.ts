import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CartService } from '../../../../core/services/api/cart.service';
import { Cart } from '../../../../core/models/cart.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  standalone: false
})
export class CartViewComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage = '';

  private cartSub!: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // ✅ Show cached cart instantly — no skeleton delay
    const cached = this.cartService.getCachedCart();
    if (cached) {
      this.cart = cached;
      this.isLoading = false;
    }

    // ✅ Refresh from server in background
    this.cartSub = this.cartService.getCart().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.cart = response?.data || response as any;
      },
      error: (error) => {
        // Only show error if we have no cached data to show
        if (!this.cart) {
          this.errorMessage = error?.error?.message || 'Failed to load cart';
          console.error('Error loading cart:', error);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cartService.getCart().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.cart = response?.data || response as any;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load cart';
        console.error('Error loading cart:', error);
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
      panelClass: 'confirmation-dialog-panel',
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
      panelClass: 'confirmation-dialog-panel',
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