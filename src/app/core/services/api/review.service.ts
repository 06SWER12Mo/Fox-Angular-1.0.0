import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Review, ReviewRequest } from '../../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // ========== PUBLIC ENDPOINTS ==========

  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  getProductAverageRating(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/product/${productId}/rating`);
  }

  getProductReviewCount(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/product/${productId}/count`);
  }

  // ========== USER ENDPOINTS ==========

  createReview(productId: number, request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/product/${productId}`, request);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/me`);
  }

  hasUserReviewedProduct(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/user/me/product/${productId}/exists`);
  }

  getMyReviewForProduct(productId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/user/me/product/${productId}`);
  }

  deleteMyReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  // ========== ADMIN/MANAGER ENDPOINTS ==========

  getPendingReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/admin/pending`);
  }

  approveReview(reviewId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/${reviewId}/approve`, {});
  }

  rejectReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${reviewId}/reject`);
  }

  getAllProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/admin/product/${productId}/all`);
  }

  deleteReviewAdmin(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${reviewId}`);
  }
}