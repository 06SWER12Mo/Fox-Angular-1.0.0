import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProductSummary } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false
})
export class ProductCardComponent {
  @Input() product!: ProductSummary;
  @Input() showAddToCart = true;
  @Output() addToCart = new EventEmitter<number>();

  // ✅ Use a default image immediately
  imageLoaded = false;
  imageError = false;
  defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em" fill="%23cccccc"%3E📷%3C/text%3E%3C/svg%3E';

  // ✅ Get image URL with fallback - don't wait for slow requests
  getImageUrl(): string {
    if (this.imageError) {
      return this.defaultImage;
    }
    
    if (this.product.primaryImageUrl) {
      if (this.product.primaryImageUrl.startsWith('http')) {
        return this.product.primaryImageUrl;
      }
      if (this.product.primaryImageUrl.startsWith('/api/images')) {
        return `http://localhost:8081${this.product.primaryImageUrl}`;
      }
      return `http://localhost:8081/api/images/${this.product.primaryImageUrl}`;
    }
    return this.defaultImage;
  }

  // ✅ Handle image loading errors immediately
  onImageError(event: Event): void {
    this.imageError = true;
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
  }

  // ✅ Handle successful load
  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product.id);
  }

  getDiscountPercentage(): number {
    return this.product.discountPercentage || 0;
  }

  hasDiscount(): boolean {
    return this.product.discountPercentage > 0;
  }

  isOutOfStock(): boolean {
    return !this.product.inStock || this.product.stockQuantity === 0;
  }
}