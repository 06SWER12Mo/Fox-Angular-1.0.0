import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../../../core/services/api/location.service';
import { DeliveryAddress} from '../../../../core/models/location.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss'],
  standalone: false
})
export class AddressListComponent implements OnInit {
  addresses: DeliveryAddress[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private locationService: LocationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.locationService.getCurrentUserAddresses().subscribe({
      next: (response: any) => {
        this.addresses = response?.data || response || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load addresses';
        console.error('Error loading addresses:', error);
      }
    });
  }

  setDefault(addressId: number): void {
    this.locationService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.addresses.forEach(a => a.isDefault = a.id === addressId);
      },
      error: (error) => {
        console.error('Error setting default address:', error);
      }
    });
  }

  editAddress(addressId: number): void {
    this.router.navigate(['/locations', addressId, 'edit']);
  }

  deleteAddress(addressId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Address',
        message: 'Are you sure you want to delete this address?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.locationService.deleteCurrentUserAddress(addressId).subscribe({
          next: () => {
            this.addresses = this.addresses.filter(a => a.id !== addressId);
          },
          error: (error) => {
            console.error('Error deleting address:', error);
          }
        });
      }
    });
  }

  addNewAddress(): void {
    this.router.navigate(['/locations/new']);
  }

  getAddressTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'home': return '🏠';
      case 'work': return '🏢';
      default: return '📍';
    }
  }

  getFullAddress(address: DeliveryAddress): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.street,
      address.building,
      address.townName
    ].filter(Boolean);
    return parts.join(', ');
  }
}