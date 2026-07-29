import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DashboardResponse,
  SalesReport,
  ProductAnalytics,
  CategoryAnalytics,
  GeographicReport,
  SalesByDay
} from '../../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // ========== DASHBOARD ==========

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  getDashboardFiltered(startDate: string, endDate: string): Observable<DashboardResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/filtered`, { params });
  }

  // ========== SALES REPORT ==========

  getSalesReport(startDate: string, endDate: string): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, { params });
  }

  getSalesReportByDateRange(startDate: string, endDate: string): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SalesReport>(`${this.apiUrl}/sales/by-date-range`, { params });
  }

  // ========== PRODUCT ANALYTICS ==========

  getTopSellingProducts(limit: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ProductAnalytics[]>(`${this.apiUrl}/products/top`, { params });
  }

  getTopSellingProductsByCategory(categoryId: number, limit: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ProductAnalytics[]>(`${this.apiUrl}/products/top-by-category/${categoryId}`, { params });
  }

  getProductAnalytics(): Observable<ProductAnalytics[]> {
    return this.http.get<ProductAnalytics[]>(`${this.apiUrl}/products`);
  }

  getProductAnalyticsById(productId: number): Observable<ProductAnalytics> {
    return this.http.get<ProductAnalytics>(`${this.apiUrl}/products/${productId}`);
  }

  getLowPerformingProducts(threshold: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<ProductAnalytics[]>(`${this.apiUrl}/products/low-performing`, { params });
  }

  // ========== CATEGORY ANALYTICS ==========

  getCategoryAnalytics(): Observable<CategoryAnalytics[]> {
    return this.http.get<CategoryAnalytics[]>(`${this.apiUrl}/categories`);
  }

  getCategoryAnalyticsById(categoryId: number): Observable<CategoryAnalytics> {
    return this.http.get<CategoryAnalytics>(`${this.apiUrl}/categories/${categoryId}`);
  }

  // ========== GEOGRAPHIC REPORT ==========

  getGeographicReport(): Observable<GeographicReport> {
    return this.http.get<GeographicReport>(`${this.apiUrl}/geographic`);
  }

  getGeographicReportByCountry(country: string): Observable<GeographicReport> {
    return this.http.get<GeographicReport>(`${this.apiUrl}/geographic/${country}`);
  }

  // ========== TIME SERIES ==========

  getSalesByDay(startDate: string, endDate: string): Observable<SalesByDay[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SalesByDay[]>(`${this.apiUrl}/sales/daily`, { params });
  }

  // ========== CUSTOMER ANALYTICS ==========

  getNewCustomersCount(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/customers/new`, { params });
  }

  getActiveCustomersCount(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/customers/active`, { params });
  }

  // ========== ORDER ANALYTICS ==========

  getOrderStatusDistribution(status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders/status/${status}`);
  }

  getAverageOrderValue(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/orders/average-value`, { params });
  }
}