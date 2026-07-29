import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PaymentMethod } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  standalone: false
})
export class PaymentFormComponent {
  @Input() selectedMethod: PaymentMethod | null = null;
  @Output() methodSelected = new EventEmitter<PaymentMethod>();

  paymentMethods = [
    { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card', icon: 'credit_card', description: 'Pay with credit or debit card' },
    { value: PaymentMethod.PAYPAL, label: 'PayPal', icon: 'paypal', description: 'Pay with your PayPal account' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer', icon: 'account_balance', description: 'Pay via bank transfer' }
  ];

  selectMethod(method: PaymentMethod): void {
    this.methodSelected.emit(method);
  }

  isSelected(method: PaymentMethod): boolean {
    return this.selectedMethod === method;
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const icons: Record<PaymentMethod, string> = {
      [PaymentMethod.CREDIT_CARD]: 'credit_card',
      [PaymentMethod.PAYPAL]: 'paypal',
      [PaymentMethod.BANK_TRANSFER]: 'account_balance'
    };
    return icons[method] || 'payment';
  }
}