import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Receipt, ReceiptRequest, Supplier, SupplierRequest } from '../../models/receipt.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = `${environment.apiUrl}/receipts`;

  constructor(private http: HttpClient) {}

  // ========== RECEIPT OPERATIONS ==========

  createReceipt(request: ReceiptRequest): Observable<Receipt> {
    return this.http.post<Receipt>(this.apiUrl, request);
  }

  getReceiptById(id: number): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/${id}`);
  }

  getReceiptByNumber(receiptNumber: string): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/number/${receiptNumber}`);
  }

  getAllReceipts(page: number = 0, size: number = 20): Observable<PageResponse<Receipt>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Receipt>>(this.apiUrl, { params });
  }

  getReceiptsBySupplier(supplierId: number, page: number = 0, size: number = 20): Observable<PageResponse<Receipt>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Receipt>>(`${this.apiUrl}/supplier/${supplierId}`, { params });
  }

  getReceiptsByStatus(status: string, page: number = 0, size: number = 20): Observable<PageResponse<Receipt>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Receipt>>(`${this.apiUrl}/status/${status}`, { params });
  }

  updateReceiptStatus(id: number, status: string): Observable<Receipt> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Receipt>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  updatePaymentStatus(id: number, paymentStatus: string): Observable<Receipt> {
    const params = new HttpParams().set('paymentStatus', paymentStatus);
    return this.http.patch<Receipt>(`${this.apiUrl}/${id}/payment-status`, null, { params });
  }

  approveReceipt(id: number): Observable<Receipt> {
    return this.http.patch<Receipt>(`${this.apiUrl}/${id}/approve`, {});
  }

  deleteReceipt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== RECEIPT STATISTICS ==========

  getTotalReceiptsAmountBetween(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/stats/total-between`, { params });
  }

  countApprovedReceiptsBetween(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/stats/count-approved-between`, { params });
  }

  // ========== SUPPLIER OPERATIONS ==========

  createSupplier(request: SupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, request);
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/suppliers/${id}`, request);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/suppliers/${id}`);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/suppliers/${id}`);
  }

  getAllSuppliers(page: number = 0, size: number = 20): Observable<PageResponse<Supplier>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Supplier>>(`${this.apiUrl}/suppliers`, { params });
  }

  searchSuppliers(keyword: string): Observable<Supplier[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers/search`, { params });
  }

  toggleSupplierActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/suppliers/${id}/toggle-active`, {});
  }
}