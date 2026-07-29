import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StoreSettings, StoreSettingsRequest } from '../../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/store-settings`;

  constructor(private http: HttpClient) {}

  // ========== PUBLIC ENDPOINTS ==========

  getPublicStoreInfo(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${this.apiUrl}/public`);
  }

  getMaintenanceStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/public/maintenance`);
  }

  getCurrencyCode(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/public/currency`);
  }

  getCurrencySymbol(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/public/currency-symbol`);
  }

  getDefaultShippingCost(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/public/shipping-cost`);
  }

  getFreeShippingThreshold(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/public/free-shipping-threshold`);
  }

  getTaxRate(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/public/tax-rate`);
  }

  isRegistrationAllowed(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/public/registration-allowed`);
  }

  // ========== ADMIN/MANAGER ENDPOINTS ==========

  getSettings(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(this.apiUrl);
  }

  updateSettings(request: StoreSettingsRequest): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(this.apiUrl, request);
  }

  uploadLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/logo`, formData);
  }

  deleteLogo(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/logo`);
  }

  uploadFavicon(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/favicon`, formData);
  }

  deleteFavicon(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favicon`);
  }

  toggleMaintenanceMode(enabled: boolean, message?: string): Observable<void> {
    let url = `${this.apiUrl}/maintenance?enabled=${enabled}`;
    if (message) url += `&message=${encodeURIComponent(message)}`;
    return this.http.patch<void>(url, {});
  }
}