import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../../../core/services/api/user.service';
import { ImageService } from '../../../../core/services/api/image.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss'],
  standalone: false
})
export class AdminProfileComponent implements OnInit {
  user: any = null;
  memberSince = '';
  lastLogin = '';

  isLoading = true;
  isSavingProfile = false;
  isChangingPassword = false;
  isUploadingAvatar = false;

  // Password visibility
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Messages
  successMessage = '';
  errorMessage = '';

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Avatar
  avatarPreviewUrl: string | null = null;
  avatarError = false;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private imageService: ImageService,
    private authService: AuthService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
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
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  private computeStats(user: any): void {
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

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSavingProfile = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { username, email, firstName, lastName, phoneNumber } = this.profileForm.value;

    this.userService.updateCurrentUser({
      username, email, firstName, lastName, phoneNumber
    }).pipe(
      finalize(() => { this.isSavingProfile = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.tokenService.setUserData(user as any);
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
      finalize(() => { this.isChangingPassword = false; this.cdr.detectChanges(); })
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

  // ==================== AVATAR ====================

  getAvatarUrl(): string {
    if (this.avatarError) return '';
    if (this.avatarPreviewUrl) return this.avatarPreviewUrl;
    const url = this.user?.profilePictureUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return 'http://localhost:8081' + url;
    return 'http://localhost:8081/api/images/' + url;
  }

  getInitials(): string {
    if (!this.user) return 'A';
    const f = this.user.firstName?.[0] || '';
    const l = this.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || this.user.username[0].toUpperCase();
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
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
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
      finalize(() => { this.isUploadingAvatar = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.successMessage = 'Avatar updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            this.user = user;
            this.tokenService.setUserData(user as any);
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
      finalize(() => { this.isUploadingAvatar = false; this.cdr.detectChanges(); })
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
}
