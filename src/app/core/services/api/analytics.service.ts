import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  /** Unwrap the backend's ApiResponse wrapper: extract `.data` if present */
  private unwrap<T>(obs: Observable<any>): Observable<T> {
    return obs.pipe(map((res: any) => res?.data ?? res));
  }

  // ========== DASHBOARD ==========

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(
      map(res => res?.data || res)
    );
  }

  getDashboardFiltered(startDate: string, endDate: string): Observable<DashboardResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/dashboard/filtered`, { params }).pipe(
      map(res => res?.data || res)
    );
  }

  // ========== SALES REPORT ==========

  getSalesReport(startDate: string, endDate: string): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<SalesReport>(
      this.http.get(`${this.apiUrl}/sales`, { params })
    );
  }

  getSalesReportByDateRange(startDate: string, endDate: string): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<SalesReport>(
      this.http.get(`${this.apiUrl}/sales/by-date-range`, { params })
    );
  }

  // ========== PRODUCT ANALYTICS ==========

  getTopSellingProducts(limit: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.unwrap<ProductAnalytics[]>(
      this.http.get(`${this.apiUrl}/products/top`, { params })
    );
  }

  getTopSellingProductsByCategory(categoryId: number, limit: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.unwrap<ProductAnalytics[]>(
      this.http.get(`${this.apiUrl}/products/top-by-category/${categoryId}`, { params })
    );
  }

  getProductAnalytics(): Observable<ProductAnalytics[]> {
    return this.unwrap<ProductAnalytics[]>(
      this.http.get(`${this.apiUrl}/products`)
    );
  }

  getProductAnalyticsById(productId: number): Observable<ProductAnalytics> {
    return this.unwrap<ProductAnalytics>(
      this.http.get(`${this.apiUrl}/products/${productId}`)
    );
  }

  getLowPerformingProducts(threshold: number = 10): Observable<ProductAnalytics[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.unwrap<ProductAnalytics[]>(
      this.http.get(`${this.apiUrl}/products/low-performing`, { params })
    );
  }

  // ========== CATEGORY ANALYTICS ==========

  getCategoryAnalytics(): Observable<CategoryAnalytics[]> {
    return this.unwrap<CategoryAnalytics[]>(
      this.http.get(`${this.apiUrl}/categories`)
    );
  }

  getCategoryAnalyticsById(categoryId: number): Observable<CategoryAnalytics> {
    return this.unwrap<CategoryAnalytics>(
      this.http.get(`${this.apiUrl}/categories/${categoryId}`)
    );
  }

  // ========== GEOGRAPHIC REPORT ==========

  getGeographicReport(): Observable<GeographicReport> {
    return this.unwrap<GeographicReport>(
      this.http.get(`${this.apiUrl}/geographic`)
    );
  }

  getGeographicReportByCountry(country: string): Observable<GeographicReport> {
    return this.unwrap<GeographicReport>(
      this.http.get(`${this.apiUrl}/geographic/${country}`)
    );
  }

  // ========== TIME SERIES ==========

  getSalesByDay(startDate: string, endDate: string): Observable<SalesByDay[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<SalesByDay[]>(
      this.http.get(`${this.apiUrl}/sales/daily`, { params })
    );
  }

  // ========== CUSTOMER ANALYTICS ==========

  getNewCustomersCount(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<number>(
      this.http.get(`${this.apiUrl}/customers/new`, { params })
    );
  }

  getActiveCustomersCount(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<number>(
      this.http.get(`${this.apiUrl}/customers/active`, { params })
    );
  }

  // ========== ORDER ANALYTICS ==========

  getOrderStatusDistribution(status: string): Observable<number> {
    return this.unwrap<number>(
      this.http.get(`${this.apiUrl}/orders/status/${status}`)
    );
  }

  getAverageOrderValue(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<number>(
      this.http.get(`${this.apiUrl}/orders/average-value`, { params })
    );
  }
}