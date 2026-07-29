import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CartItem } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: false
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Input() isUpdating = false;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  imageLoaded = false;
  imageError = false;

  defaultImage = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="#1f232b"/>' +
    '<rect x="70" y="55" width="60" height="90" rx="8" fill="none" stroke="#5b6472" stroke-width="2"/>' +
    '<circle cx="100" cy="95" r="15" fill="none" stroke="#5b6472" stroke-width="2"/>' +
    '<path d="M75 130l12-18 10 14 14-22 17 26" fill="none" stroke="#5b6472" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  );

  increment(): void {
    this.quantityChange.emit(this.item.quantity + 1);
  }

  decrement(): void {
    if (this.item.quantity > 1) {
      this.quantityChange.emit(this.item.quantity - 1);
    }
  }

  onRemove(): void {
    this.remove.emit();
  }

  getProductUrl(): string {
    return `/products/${this.item.productId}`;
  }

  getImageUrl(): string {
    if (this.imageError) {
      return this.defaultImage;
    }
    const url = this.item.imageUrl;
    if (url) {
      // Use the URL from the API if available
      if (url.startsWith('http')) return url;
      if (url.startsWith('/api/images')) return `http://localhost:8081${url}`;
      return `http://localhost:8081/api/images/${url}`;
    }
    // Fallback: build image URL directly from product ID
    // Backend stores primary images at: /api/images/products/{productId}/main.jpg
    return `http://localhost:8081/api/images/products/${this.item.productId}/main.jpg`;
  }

  onImageError(event: Event): void {
    this.imageError = true;
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }
}