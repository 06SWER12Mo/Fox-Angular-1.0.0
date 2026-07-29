import { Component, Input } from '@angular/core';
import { CartItem } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
  standalone: false
})
export class OrderSummaryComponent {
  @Input() subtotal = 0;
  @Input() shipping = 0;
  @Input() tax = 0;
  @Input() total = 0;
  @Input() items: CartItem[] = [];

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}