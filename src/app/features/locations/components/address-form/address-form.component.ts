import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../../../core/services/api/location.service';
import { DeliveryAddress } from '../../../../core/models/location.model';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  standalone: false
})
export class AddressFormComponent implements OnInit {
  addressForm!: FormGroup;
  isEditMode = false;
  addressId?: number;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.addressId = +params['id'];
        this.loadAddress(this.addressId);
      }
    });
  }

  initForm(): void {
    this.addressForm = this.fb.group({
      addressLine1: ['', [Validators.required, Validators.maxLength(255)]],
      addressLine2: ['', [Validators.maxLength(255)]],
      street: ['', [Validators.required, Validators.maxLength(100)]],
      building: ['', [Validators.maxLength(100)]],
      floor: ['', [Validators.maxLength(50)]],
      apartment: ['', [Validators.maxLength(50)]],
      landmark: ['', [Validators.maxLength(100)]],
      recipientName: ['', [Validators.maxLength(100)]],
      recipientPhone: ['', [Validators.maxLength(20)]],
      isDefault: [false],
      addressType: ['home'],
      additionalInstructions: ['', [Validators.maxLength(500)]],
      townId: [null]
    });
  }

  loadAddress(id: number): void {
    this.isLoading = true;
    this.locationService.getCurrentUserAddresses().subscribe({
      next: (response: any) => {
        const addresses = response?.data || response || [];
        const address = addresses.find((a: DeliveryAddress) => a.id === id);
        
        if (address) {
          this.addressForm.patchValue({
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            street: address.street,
            building: address.building,
            floor: address.floor,
            apartment: address.apartment,
            landmark: address.landmark,
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            isDefault: address.isDefault,
            addressType: address.addressType || 'home',
            additionalInstructions: address.additionalInstructions,
            townId: address.townId
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load address';
        console.error('Error loading address:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.addressForm.value;

    if (this.isEditMode && this.addressId) {
      this.locationService.updateCurrentUserAddress(this.addressId, formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Address updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/locations']);
          }, 1500);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error?.error?.message || 'Failed to update address';
          console.error('Error updating address:', error);
        }
      });
    } else {
      this.locationService.addAddressForCurrentUser(formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Address added successfully!';
          setTimeout(() => {
            this.router.navigate(['/locations']);
          }, 1500);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error?.error?.message || 'Failed to add address';
          console.error('Error adding address:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/locations']);
  }
}