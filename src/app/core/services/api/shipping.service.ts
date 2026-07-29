import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  ShippingBatch, 
  AssignBusRequest, 
  DeliveryConfirmationRequest,
  Bus,
  ShippingDashboard,
  ShippingStats
} from '../../models/shipping.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private apiUrl = `${environment.apiUrl}/shipping`;

  constructor(private http: HttpClient) {}

  // ========== BATCH MANAGEMENT ==========

  createBatch(bigAreaId: number, minimumOrders: number = 10): Observable<ShippingBatch> {
    const params = new HttpParams()
      .set('bigAreaId', bigAreaId.toString())
      .set('minimumOrders', minimumOrders.toString());
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches`, null, { params });
  }

  getAllBatches(): Observable<ShippingBatch[]> {
    return this.http.get<ShippingBatch[]>(`${this.apiUrl}/batches`);
  }

  getBatchById(id: number): Observable<ShippingBatch> {
    return this.http.get<ShippingBatch>(`${this.apiUrl}/batches/${id}`);
  }

  getBatchesByStatus(status: string): Observable<ShippingBatch[]> {
    return this.http.get<ShippingBatch[]>(`${this.apiUrl}/batches/status/${status}`);
  }

  getBatchesByBigAreaId(bigAreaId: number): Observable<ShippingBatch[]> {
    return this.http.get<ShippingBatch[]>(`${this.apiUrl}/batches/big-area/${bigAreaId}`);
  }

  getBatches(
    status?: string, 
    bigAreaId?: number, 
    dateFrom?: string, 
    dateTo?: string,
    page: number = 0, 
    size: number = 20
  ): Observable<PageResponse<ShippingBatch>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) params = params.set('status', status);
    if (bigAreaId) params = params.set('bigAreaId', bigAreaId.toString());
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    
    return this.http.get<PageResponse<ShippingBatch>>(`${this.apiUrl}/batches`, { params });
  }

  // ========== ORDER ASSIGNMENT ==========

  addOrderToBatch(batchId: number, orderId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/orders/${orderId}`, {});
  }

  removeOrderFromBatch(batchId: number, orderId: number): Observable<ShippingBatch> {
    return this.http.delete<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/orders/${orderId}`);
  }

  // ========== BUS ASSIGNMENT ==========

  assignBusToBatch(request: AssignBusRequest): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/assign-bus`, request);
  }

  autoAssignBus(batchId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/auto-assign-bus`, {});
  }

  // ========== BATCH LIFECYCLE ==========

  markBatchReadyToDispatch(batchId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/ready`, {});
  }

  dispatchBatch(batchId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/dispatch`, {});
  }

  autoDeliverBatch(batchId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/auto-deliver`, {});
  }

  confirmDelivery(request: DeliveryConfirmationRequest): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/deliver`, request);
  }

  cancelBatch(batchId: number): Observable<ShippingBatch> {
    return this.http.post<ShippingBatch>(`${this.apiUrl}/batches/${batchId}/cancel`, {});
  }

  // ========== ORDER TRACKING ==========

  getBatchByOrderId(orderId: number): Observable<ShippingBatch> {
    return this.http.get<ShippingBatch>(`${this.apiUrl}/orders/${orderId}/batch`);
  }

  isOrderInBatch(orderId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/orders/${orderId}/in-batch`);
  }

  // ========== DASHBOARD & STATISTICS ==========

  getDashboard(): Observable<ShippingDashboard> {
    return this.http.get<ShippingDashboard>(`${this.apiUrl}/dashboard`);
  }

  getStats(startDate?: string, endDate?: string): Observable<ShippingStats> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ShippingStats>(`${this.apiUrl}/stats`, { params });
  }

  // ========== BUS MANAGEMENT ==========

  getBuses(isActive?: boolean): Observable<Bus[]> {
    let params = new HttpParams();
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());
    return this.http.get<Bus[]>(`${this.apiUrl}/buses`, { params });
  }

  getAvailableBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.apiUrl}/buses/available`);
  }

  getBusById(id: number): Observable<Bus> {
    return this.http.get<Bus>(`${this.apiUrl}/buses/${id}`);
  }

  // ========== SCHEDULER OPERATIONS ==========

  triggerAutoCreateBatches(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/scheduler/auto-create`, {});
  }

  triggerAutoDispatch(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/scheduler/auto-dispatch`, {});
  }

  triggerAutoDeliver(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/scheduler/auto-deliver`, {});
  }

  getPendingDispatches(): Observable<ShippingBatch[]> {
    return this.http.get<ShippingBatch[]>(`${this.apiUrl}/scheduler/pending-dispatches`);
  }
}