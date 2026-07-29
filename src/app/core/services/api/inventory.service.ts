import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  InventoryTransaction, 
  StockAdjustmentRequest, 
  InventoryReport 
} from '../../models/inventory.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  // ========== TRANSACTIONS ==========

  getAllTransactions(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions`);
  }

  getAllTransactionsPaged(page: number = 0, size: number = 20): Observable<PageResponse<InventoryTransaction>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<InventoryTransaction>>(`${this.apiUrl}/transactions/paged`, { params });
  }

  getTransactionById(id: number): Observable<InventoryTransaction> {
    return this.http.get<InventoryTransaction>(`${this.apiUrl}/transactions/${id}`);
  }

  getTransactionsByProductId(productId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/product/${productId}`);
  }

  getTransactionsByProductIdPaged(productId: number, page: number = 0, size: number = 20): Observable<PageResponse<InventoryTransaction>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<InventoryTransaction>>(`${this.apiUrl}/transactions/product/${productId}/paged`, { params });
  }

  getTransactionsByType(type: string): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/type/${type}`);
  }

  getTransactionsByDateRange(startDate: string, endDate: string): Observable<InventoryTransaction[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/date-range`, { params });
  }

  getTransactionsByReferenceId(referenceId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/reference/${referenceId}`);
  }

  // ========== STOCK ADJUSTMENT ==========

  adjustStock(request: StockAdjustmentRequest): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(`${this.apiUrl}/adjust`, request);
  }

  getStockAdjustmentsByProductId(productId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/adjustments/product/${productId}`);
  }

  // ========== REPORTS ==========

  getInventoryReportByProductId(productId: number): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.apiUrl}/reports/product/${productId}`);
  }

  getAllInventoryReports(): Observable<InventoryReport[]> {
    return this.http.get<InventoryReport[]>(`${this.apiUrl}/reports`);
  }

  // ========== STOCK LEVELS ==========

  getCurrentStockByProductId(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stock/product/${productId}`);
  }

  getLowStockProducts(threshold: number = 10): Observable<InventoryReport[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<InventoryReport[]>(`${this.apiUrl}/stock/low`, { params });
  }

  getOutOfStockProducts(): Observable<InventoryReport[]> {
    return this.http.get<InventoryReport[]>(`${this.apiUrl}/stock/out-of-stock`);
  }

  // ========== STATISTICS ==========

  getTotalTransactionCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total-transactions`);
  }

  getTransactionCountByType(type: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/transactions-by-type/${type}`);
  }

  getTotalStockValue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total-stock`);
  }

  getTotalReceivedStock(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/received`);
  }

  getTotalSoldStock(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/sold`);
  }

  getTotalDamagedStock(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/damaged`);
  }

  getTotalReturnedStock(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/returned`);
  }
}