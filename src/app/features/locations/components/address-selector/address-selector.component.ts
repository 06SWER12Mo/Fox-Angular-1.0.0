import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryAddress } from '../../../../core/models/location.model';

@Component({
  selector: 'app-address-selector',
  templateUrl: './address-selector.component.html',
  styleUrls: ['./address-selector.component.scss'],
  standalone: false
})
export class AddressSelectorComponent {
  @Input() addresses: DeliveryAddress[] = [];
  @Input() selectedAddressId: number | null = null;
  @Output() addressSelected = new EventEmitter<number>();

  constructor(private router: Router) {}

  selectAddress(addressId: number): void {
    this.addressSelected.emit(addressId);
  }

  isSelected(addressId: number): boolean {
    return this.selectedAddressId === addressId;
  }

  addNewAddress(): void {
    // Navigate to add address page with return URL
    this.router.navigate(['/locations/new'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }

    editAddress(addressId: number): void {
    this.router.navigate(['/locations', addressId, 'edit']);
  }

  getFullAddress(address: DeliveryAddress): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.street,
      address.building ? `Building ${address.building}` : '',
      address.floor ? `Floor ${address.floor}` : '',
      address.apartment ? `Apt ${address.apartment}` : '',
      address.townName
    ].filter(Boolean);
    return parts.join(', ');
  }
}