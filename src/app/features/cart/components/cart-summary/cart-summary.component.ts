import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cart } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
  standalone: false
})
export class CartSummaryComponent {
  @Input() cart: Cart | null = null;
  @Input() isUpdating = false;
  @Output() checkout = new EventEmitter<void>();

  getTotalItems(): number {
    return this.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getSubtotal(): number {
    return this.cart?.totalPrice || 0;
  }

  getShipping(): number {
    // Free shipping over $50
    const subtotal = this.getSubtotal();
    return subtotal >= 50 ? 0 : 5;
  }

  getTax(): number {
    return this.getSubtotal() * 0.07; // 7% tax
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  getFreeShippingProgress(): number {
    const subtotal = this.getSubtotal();
    const threshold = 50;
    if (subtotal >= threshold) return 100;
    return (subtotal / threshold) * 100;
  }

  isFreeShippingAvailable(): boolean {
    return this.getSubtotal() >= 50;
  }
}