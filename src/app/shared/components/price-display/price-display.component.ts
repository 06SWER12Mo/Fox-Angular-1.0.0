import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price-display',
  templateUrl: './price-display.component.html',
  styleUrls: ['./price-display.component.scss'],
  standalone: false
})
export class PriceDisplayComponent {
  @Input() price!: number;
  @Input() originalPrice?: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  hasDiscount(): boolean {
    return !!this.originalPrice && this.originalPrice > this.price;
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.originalPrice! - this.price) / this.originalPrice!) * 100);
  }

  getOriginalPrice(): number {
    return this.originalPrice || 0;
  }
}