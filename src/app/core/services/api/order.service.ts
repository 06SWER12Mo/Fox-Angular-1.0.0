import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Order, 
  OrderSummary, 
  PlaceOrderRequest, 
  UpdateOrderStatusRequest,
  TrackingResponse,
  OrderTrackingRequest
} from '../../models/order.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // ========== USER ENDPOINTS ==========

  getMyOrders(page: number = 0, size: number = 10): Observable<PageResponse<OrderSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<OrderSummary>>(`${this.apiUrl}/my-orders`, { params });
  }

  getMyOrdersByStatus(status: string, page: number = 0, size: number = 10): Observable<PageResponse<OrderSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<OrderSummary>>(`${this.apiUrl}/my-orders/status/${status}`, { params });
  }

  getMyOrderCount(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any>(`${this.apiUrl}/my-orders/count`, { params });
  }

  getMyRecentOrders(limit: number = 5): Observable<OrderSummary[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<OrderSummary[]>(`${this.apiUrl}/my-orders/recent`, { params });
  }

  placeOrder(request: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  // ========== PUBLIC ENDPOINTS ==========

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  getOrderSummary(id: number): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.apiUrl}/${id}/summary`);
  }

  trackOrder(request: OrderTrackingRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/track`, request);
  }

  getTrackingDetails(trackingCode: string): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.apiUrl}/track/${trackingCode}`);
  }

  // ========== ADMIN/MANAGER ENDPOINTS ==========

  getAllOrders(page: number = 0, size: number = 10): Observable<PageResponse<OrderSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<OrderSummary>>(`${this.apiUrl}/paged`, { params });
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getOrdersByUser(userId: number): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.apiUrl}/user/${userId}`);
  }

  getOrdersByUserPaginated(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<OrderSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<OrderSummary>>(`${this.apiUrl}/user/${userId}/paged`, { params });
  }

  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, request);
  }

  confirmDelivery(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/confirm-delivery`, {});
  }

  markOrderReadyForShipping(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/ready-for-shipping`, {});
  }
}