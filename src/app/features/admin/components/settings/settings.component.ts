import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StoreService } from '../../../../core/services/api/store.service';
import { StoreSettings, StoreSettingsRequest } from '../../../../core/models/store.model';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../products/product-form.component.scss'],
  standalone: false
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  isSaving = false;
  isLoading = true;
  errorMessage: string | null = null;
  saveSuccess = false;
  lastUpdated: string | null = null;
  updatedBy: string | null = null;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      storeName: [''],
      storeDescription: [''],
      contactEmail: [''],
      contactPhone: [''],
      contactAddress: [''],

      currencyCode: ['ILS'],
      currencySymbol: ['₪'],
      taxRate: [0],
      defaultShippingCost: [0],
      freeShippingThreshold: [0],
      facebookUrl: [''],
      twitterUrl: [''],
      instagramUrl: [''],
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.saveSuccess = false;

    this.storeService.getSettings().subscribe({
      next: (data: any) => {
        const s = data;
        this.settingsForm.patchValue({
          storeName: s.storeName || '',
          storeDescription: s.storeDescription || '',
          contactEmail: s.contactEmail || '',
          contactPhone: s.contactPhone || '',
          contactAddress: s.contactAddress || '',

          currencyCode: s.currencyCode || 'ILS',
          currencySymbol: s.currencySymbol || '₪',
          taxRate: s.taxRate || 0,
          defaultShippingCost: s.defaultShippingCost || 0,
          freeShippingThreshold: s.freeShippingThreshold || 0,
          facebookUrl: s.facebookUrl || '',
          twitterUrl: s.twitterUrl || '',
          instagramUrl: s.instagramUrl || '',
        });
        if (s.storeLogo) this.logoPreview = s.storeLogo;
        this.lastUpdated = s.updatedAt || null;
        this.updatedBy = s.updatedBy || null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Settings] Failed to load settings:', err);
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to load store settings.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = e.target?.result as string;
      reader.readAsDataURL(file);
      // Upload immediately
      this.storeService.uploadLogo(file).subscribe({
        next: (res: any) => {
          const url = res?.data?.url || res?.url || res;
          if (url) this.logoPreview = url;
        },
        error: (err) => console.error('[Settings] Logo upload failed:', err)
      });
    }
  }

  save(): void {
    this.isSaving = true;
    this.saveSuccess = false;
    const form = this.settingsForm.value;
    const request: StoreSettingsRequest = {
      storeName: form.storeName,
      storeDescription: form.storeDescription,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      contactAddress: form.contactAddress,

      currencyCode: form.currencyCode,
      currencySymbol: form.currencySymbol,
      taxRate: form.taxRate,
      defaultShippingCost: form.defaultShippingCost,
      freeShippingThreshold: form.freeShippingThreshold,
      facebookUrl: form.facebookUrl,
      twitterUrl: form.twitterUrl,
      instagramUrl: form.instagramUrl,
    };
    this.storeService.updateSettings(request).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        const s = res;
        if (s) {
          this.lastUpdated = s.updatedAt || null;
          this.updatedBy = s.updatedBy || null;
        }
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('[Settings] Save failed:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
