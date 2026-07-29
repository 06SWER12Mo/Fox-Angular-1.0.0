import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../../../core/services/api/cart.service';
import { OrderService } from '../../../../core/services/api/order.service';
import { LocationService } from '../../../../core/services/api/location.service';
import { Cart } from '../../../../core/models/cart.model';
import { DeliveryAddress } from '../../../../core/models/location.model';
import { PlaceOrderRequest, Order } from '../../../../core/models/order.model';
import { PaymentMethod } from '../../../../core/models/enums.model';
import { ApiResponse } from '../../../../core/models/common.model';

@Component({
  selector: 'app-checkout-main',
  templateUrl: './checkout-main.component.html',
  styleUrls: ['./checkout-main.component.scss'],
  standalone: false
})
export class CheckoutMainComponent implements OnInit {
  cart: Cart | null = null;
  addresses: DeliveryAddress[] = [];
  isLoading = true;
  isPlacingOrder = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;

  addressForm!: FormGroup;
  paymentForm!: FormGroup;

  selectedAddressId: number | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,

    private locationService: LocationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.addressForm = this.fb.group({
      addressId: ['', [Validators.required]]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['', [Validators.required]]
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (response: any) => {
        // ✅ Safe access with fallback
        this.cart = response?.data || response || null;
        if (!this.cart?.items?.length) {
          this.router.navigate(['/cart']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load cart';
        console.error('Error loading cart:', error);
      }
    });
  }

  loadAddresses(): void {
    this.locationService.getCurrentUserAddresses().subscribe({
      next: (response: any) => {
        // ✅ Safe access with fallback
        this.addresses = response?.data || response || [];
        const defaultAddress = this.addresses.find(a => a.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.addressForm.patchValue({ addressId: defaultAddress.id });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.isLoading = false;
      }
    });
  }

  onAddressSelected(addressId: number): void {
    this.selectedAddressId = addressId;
    this.addressForm.patchValue({ addressId });
    this.errorMessage = '';
  }

  onPaymentMethodSelected(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    this.paymentForm.patchValue({ paymentMethod: method });
    this.errorMessage = '';
  }

  goToStep(step: number): void {
    if (step === 2 && !this.selectedAddressId) {
      this.errorMessage = 'Please select a delivery address';
      return;
    }
    if (step === 3 && !this.selectedPaymentMethod) {
      this.errorMessage = 'Please select a payment method';
      return;
    }
    this.errorMessage = '';
    this.currentStep = step;
  }

  placeOrder(): void {
    if (!this.selectedAddressId || !this.selectedPaymentMethod) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    if (!this.cart?.items?.length) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    this.isPlacingOrder = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: PlaceOrderRequest = {
      deliveryAddressId: this.selectedAddressId,
      cartId: this.cart.id
    };

    // Place order — backend handles payment internally
    this.orderService.placeOrder(request).subscribe({
      next: (orderResponse: any) => {
        const orderId = orderResponse?.data?.id || orderResponse?.id;
        
        if (!orderId) {
          this.isPlacingOrder = false;
          this.errorMessage = 'Failed to get order ID';
          return;
        }

        // Show success and navigate to orders page
        this.isPlacingOrder = false;
        this.successMessage = 'Order placed successfully!';
        this.cartService.refreshCartCount();
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 1200);
      },
      error: (orderError) => {
        this.isPlacingOrder = false;
        this.errorMessage = orderError?.error?.message || 'Failed to place order. Please try again.';
        console.error('Order error:', orderError);
      }
    });
  }

  getSelectedAddress(): DeliveryAddress | undefined {
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  getPaymentMethodLabel(): string {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.PAYPAL]: 'PayPal',
      [PaymentMethod.CREDIT_CARD]: 'Credit Card',
      [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer'
    };
    return this.selectedPaymentMethod ? labels[this.selectedPaymentMethod] : '';
  }

  getSubtotal(): number {
    return this.cart?.totalPrice || 0;
  }

  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal >= 50 ? 0 : 5;
  }

  getTax(): number {
    return this.getSubtotal() * 0.07;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepComplete(step: number): boolean {
    if (step === 1) return !!this.selectedAddressId;
    if (step === 2) return !!this.selectedPaymentMethod;
    return false;
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}