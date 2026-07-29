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
    '<rect width="200" height="200" fill="#f0f0f0"/>' +
    '<text x="50%" y="50%" font-size="40" text-anchor="middle" dy=".3em" fill="#cccccc">📷</text>' +
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
    if (!url) return this.defaultImage;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return 'http://localhost:8081' + url;
    return 'http://localhost:8081/api/images/' + url;
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