import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../../../core/services/api/user.service';
import { ImageService } from '../../../../core/services/api/image.service';
import { LocationService } from '../../../../core/services/api/location.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { TokenService } from '../../../../core/services/token.service';
import { User } from '../../../../core/models/user.model';
import { DeliveryAddress, DeliveryAddressRequest } from '../../../../core/models/location.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  user!: User;
  addresses: DeliveryAddress[] = [];
  memberSince = '';
  lastLogin = '';
  orderCount = 0;

  // Loading states
  isLoading = false;
  isSavingProfile = false;
  isChangingPassword = false;
  isUploadingAvatar = false;
  isDeletingAccount = false;
  isSendingVerification = false;
  isLoadingAddresses = false;
  isSavingAddress = false;
  editingAddressId: number | null = null;
  showAddressForm = false;

  // Password visibility
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Messages
  successMessage = '';
  errorMessage = '';
  infoMessage = '';

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;

  // Avatar
  avatarPreviewUrl: string | null = null;
  avatarError = false;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private imageService: ImageService,
    private locationService: LocationService,
    private authService: AuthService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phoneNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: (g: FormGroup) =>
        g.get('newPassword')?.value === g.get('confirmPassword')?.value
          ? null : { mismatch: true }
    });

    this.addressForm = this.fb.group({
      addressLine1: ['', [Validators.required]],
      street: ['', [Validators.required]],
      building: [''],
      floor: [''],
      apartment: [''],
      landmark: [''],
      recipientName: [''],
      recipientPhone: [''],
      isDefault: [false],
      addressType: ['home'],
      townId: [null]
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (user) => {
        this.user = user;
        // Sync to localStorage & emit through BehaviorSubject so the header picks up changes
        this.tokenService.setUserData(user as any);
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || ''
        });
        this.computeStats(user);
        this.loadAddresses();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSavingProfile = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { username, email, firstName, lastName, phoneNumber } = this.profileForm.value;

    this.userService.updateCurrentUser({
      username, email, firstName, lastName, phoneNumber
    }).pipe(
      finalize(() => {
        this.isSavingProfile = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update profile';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.updateCurrentUser({ currentPassword, newPassword }).pipe(
      finalize(() => {
        this.isChangingPassword = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Password changed! Logging out...';
        this.passwordForm.reset();
        setTimeout(() => {
          this.authService.logout().subscribe(() => {
            window.location.href = '/';
          });
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to change password';
      }
    });
  }

  // ==================== STATS ====================

  private computeStats(user: User): void {
    if (user.createdAt) {
      const d = new Date(user.createdAt);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      this.memberSince = `${months[d.getMonth()]} ${d.getFullYear()}`;
    } else {
      this.memberSince = '—';
    }
    if (user.lastLogin) {
      const d = new Date(user.lastLogin);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) this.lastLogin = 'Just now';
      else if (hours < 24) this.lastLogin = `${hours}h ago`;
      else this.lastLogin = d.toLocaleDateString();
    } else {
      this.lastLogin = '—';
    }
  }

  // ==================== PROFILE UPDATE ====================

  getAvatarUrl(): string {
    if (this.avatarError) return '';
    if (this.avatarPreviewUrl) return this.avatarPreviewUrl;
    const url = this.user?.profilePictureUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return 'http://localhost:8081' + url;
    return 'http://localhost:8081/api/images/' + url;
  }

  onAvatarError(): void {
    this.avatarError = true;
  }

  onAvatarLoad(): void {
    this.avatarError = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleAvatarFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleAvatarFile(file);
      input.value = '';
    }
  }

  private handleAvatarFile(file: File): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be less than 5MB';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadAvatar(file);
  }

  private uploadAvatar(file: File): void {
    this.isUploadingAvatar = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.imageService.uploadCurrentUserAvatar(file).pipe(
      finalize(() => {
        this.isUploadingAvatar = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Avatar updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);

        // Re-fetch the full user profile — this will call setUserData and emit to the header
        // Keep the preview alive during re-fetch to avoid flicker
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            this.user = user;
            this.tokenService.setUserData(user as any);
            this.profileForm.patchValue({
              username: user.username,
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phoneNumber: user.phoneNumber || ''
            });
            this.computeStats(user);
            this.loadAddresses();
            // Now the user has the correct profilePictureUrl — clear the preview
            this.avatarPreviewUrl = null;
            this.avatarError = false;
          },
          error: () => {
            this.avatarPreviewUrl = null;
            this.avatarError = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to upload avatar';
        this.avatarPreviewUrl = null;
      }
    });
  }

  removeAvatar(): void {
    if (!this.user?.profilePictureUrl) return;

    this.isUploadingAvatar = true;
    this.imageService.deleteCurrentUserAvatar().pipe(
      finalize(() => {
        this.isUploadingAvatar = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.user.profilePictureUrl = '';
        this.avatarPreviewUrl = null;
        this.avatarError = false;
        this.successMessage = 'Avatar removed';
        setTimeout(() => this.successMessage = '', 3000);

        const storedUser = this.tokenService.getUserData();
        if (storedUser) {
          storedUser.profilePictureUrl = '';
          this.tokenService.setUserData(storedUser);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to remove avatar';
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '';
    const first = this.user.firstName?.[0] || '';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || this.user.username[0].toUpperCase();
  }

  // ==================== EMAIL VERIFICATION ====================

  sendVerificationEmail(): void {
    this.isSendingVerification = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.userService.requestEmailVerification().pipe(
      finalize(() => {
        this.isSendingVerification = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        // Update local state immediately
        if (this.user) {
          this.user.verificationRequested = true;
        }
        this.successMessage = ''; // Clear any old success
        this.infoMessage = 'You asked for verification. Fox will review your email as soon as possible.';
        setTimeout(() => this.infoMessage = '', 6000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send verification request';
      }
    });
  }

  cancelVerificationRequest(): void {
    this.isSendingVerification = true;
    this.errorMessage = '';
    this.userService.cancelEmailVerification().pipe(
      finalize(() => {
        this.isSendingVerification = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        if (this.user) {
          this.user.verificationRequested = false;
        }
        this.infoMessage = 'Verification request cancelled.';
        setTimeout(() => this.infoMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to cancel verification request';
      }
    });
  }

  // ==================== ADDRESS MANAGEMENT ====================

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.locationService.getCurrentUserAddresses().pipe(
      finalize(() => {
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: () => {
        this.errorMessage = 'Failed to load addresses';
      }
    });
  }

  openAddressForm(address?: DeliveryAddress): void {
    this.showAddressForm = true;
    this.editingAddressId = address?.id || null;
    this.errorMessage = '';
    this.successMessage = '';
    if (address) {
      this.addressForm.patchValue({
        addressLine1: address.addressLine1,
        street: address.street,
        building: address.building || '',
        floor: address.floor || '',
        apartment: address.apartment || '',
        landmark: address.landmark || '',
        recipientName: address.recipientName || '',
        recipientPhone: address.recipientPhone || '',
        isDefault: address.isDefault,
        addressType: address.addressType || 'home',
        townId: address.townId
      });
    } else {
      this.addressForm.reset({
        addressLine1: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
        landmark: '',
        recipientName: '',
        recipientPhone: '',
        isDefault: false,
        addressType: 'home',
        townId: null
      });
    }
  }

  closeAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;
    this.isSavingAddress = true;
    this.errorMessage = '';
    const data: DeliveryAddressRequest = this.addressForm.value;
    const obs = this.editingAddressId
      ? this.locationService.updateCurrentUserAddress(this.editingAddressId, data)
      : this.locationService.addAddressForCurrentUser(data);
    obs.pipe(finalize(() => {
      this.isSavingAddress = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: () => {
        this.successMessage = this.editingAddressId ? 'Address updated!' : 'Address added!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeAddressForm();
        this.loadAddresses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save address';
      }
    });
  }

  setDefaultAddress(addressId: number): void {
    this.locationService.setDefaultAddress(addressId).subscribe({
      next: () => this.loadAddresses(),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to set default address';
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Delete this address?')) return;
    this.locationService.deleteCurrentUserAddress(addressId).subscribe({
      next: () => {
        this.successMessage = 'Address deleted';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadAddresses();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete address';
      }
    });
  }

  getAddressTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'home': return '🏠';
      case 'work': return '🏢';
      default: return '📍';
    }
  }

  // ==================== ACCOUNT DELETION ====================

  deleteAccount(): void {
    if (!confirm('⚠️ Permanently delete your account? This cannot be undone!')) return;
    if (!confirm('Last chance — all data will be lost. Delete?')) return;
    this.isDeletingAccount = true;
    this.userService.deleteCurrentUser().pipe(
      finalize(() => {
        this.isDeletingAccount = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.tokenService.clearAll();
        window.location.href = '/';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete account';
      }
    });
  }

  // ==================== UTILITIES ====================

  getFullAddress(address: DeliveryAddress): string {
    return [address.addressLine1, address.street, address.building, address.townName]
      .filter(Boolean).join(', ');
  }
}