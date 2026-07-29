import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentMethod } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  standalone: false
})
export class PaymentFormComponent implements OnInit {
  @Input() selectedMethod: PaymentMethod | null = null;
  @Output() methodSelected = new EventEmitter<PaymentMethod>();

  paymentForm!: FormGroup;

  paymentMethods = [
    { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card', description: 'Pay with credit or debit card' },
    { value: PaymentMethod.PAYPAL, label: 'PayPal', description: 'Pay with your PayPal account' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer', description: 'Pay via bank transfer' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.pattern(/^[\d\s-]{16,19}$/)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cardCvv: ['', [Validators.pattern(/^\d{3,4}$/)]],
      cardName: ['', [Validators.minLength(2)]],
      paypalEmail: ['', [Validators.email]]
    });
  }

  selectMethod(method: PaymentMethod): void {
    this.methodSelected.emit(method);
  }

  isSelected(method: PaymentMethod): boolean {
    return this.selectedMethod === method;
  }

  formatCardNumber(): void {
    let val = this.paymentForm.get('cardNumber')?.value || '';
    val = val.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1-');
    this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
  }

  formatExpiry(): void {
    let val = this.paymentForm.get('cardExpiry')?.value || '';
    val = val.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    this.paymentForm.get('cardExpiry')?.setValue(val, { emitEvent: false });
  }

  get PaymentMethod(): typeof PaymentMethod {
    return PaymentMethod;
  }
}