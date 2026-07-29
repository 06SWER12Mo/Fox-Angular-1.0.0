import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Image, ImageUploadRequest } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  // ========== PRODUCT IMAGES ==========

  uploadProductImage(
    productId: number, 
    file: File, 
    imageType: string = 'GALLERY', 
    displayOrder?: number, 
    altText?: string
  ): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);
    if (displayOrder !== undefined) formData.append('displayOrder', displayOrder.toString());
    if (altText) formData.append('altText', altText);
    
    return this.http.post<Image>(`${this.apiUrl}/products/${productId}`, formData);
  }

  getProductImages(productId: number): Observable<Image[]> {
    return this.http.get<Image[]>(`${this.apiUrl}/products/${productId}`);
  }

  getPrimaryProductImage(productId: number): Observable<Image> {
    return this.http.get<Image>(`${this.apiUrl}/products/${productId}/primary`);
  }

  setPrimaryProductImage(productId: number, imageId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${productId}/primary/${imageId}`, {});
  }

  // ========== VARIANT IMAGES ==========

  uploadVariantImage(variantId: number, file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Image>(`${this.apiUrl}/variants/${variantId}`, formData);
  }

  // ========== CATEGORY IMAGES ==========

  uploadCategoryImage(categoryId: number, file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Image>(`${this.apiUrl}/categories/${categoryId}`, formData);
  }

  // ========== SUBCATEGORY IMAGES ==========

  uploadSubcategoryImage(subcategoryId: number, file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Image>(`${this.apiUrl}/subcategories/${subcategoryId}`, formData);
  }

  // ========== USER AVATARS ==========

  uploadUserAvatar(userId: number, file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Image>(`${this.apiUrl}/users/${userId}/avatar`, formData);
  }

  uploadCurrentUserAvatar(file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Image>(`${this.apiUrl}/me/avatar`, formData);
  }

  getCurrentUserAvatar(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/me/avatar`);
  }

  deleteCurrentUserAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/avatar`);
  }

  // ========== DELETE ==========

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${imageId}`);
  }

  deleteAllImages(entityType: string, entityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${entityType}/${entityId}`);
  }

  // ========== HELPER ==========

  getImageUrl(path: string): string {
    return `${environment.imageUrl}/${path}`;
  }
}