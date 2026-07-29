import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  BigArea, 
  BigAreaRequest, 
  Town, 
  TownRequest, 
  DeliveryAddress, 
  DeliveryAddressRequest 
} from '../../models/location.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  // ========== BIG AREA ENDPOINTS ==========

  // Admin
  createBigArea(request: BigAreaRequest): Observable<BigArea> {
    return this.http.post<BigArea>(`${this.apiUrl}/big-areas`, request);
  }

  updateBigArea(id: number, request: BigAreaRequest): Observable<BigArea> {
    return this.http.put<BigArea>(`${this.apiUrl}/big-areas/${id}`, request);
  }

  deleteBigArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/big-areas/${id}`);
  }

  toggleBigAreaActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/big-areas/${id}/toggle-active`, {});
  }

  // Public
  getAllBigAreas(): Observable<BigArea[]> {
    return this.http.get<BigArea[]>(`${this.apiUrl}/big-areas`);
  }

  getActiveBigAreas(): Observable<BigArea[]> {
    return this.http.get<BigArea[]>(`${this.apiUrl}/big-areas/active`);
  }

  getBigAreaById(id: number): Observable<BigArea> {
    return this.http.get<BigArea>(`${this.apiUrl}/big-areas/${id}`);
  }

  searchBigAreas(keyword: string): Observable<BigArea[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<BigArea[]>(`${this.apiUrl}/big-areas/search`, { params });
  }

  countTownsByBigArea(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/big-areas/${id}/town-count`);
  }

  // ========== TOWN ENDPOINTS ==========

  // Admin
  createTown(request: TownRequest): Observable<Town> {
    return this.http.post<Town>(`${this.apiUrl}/towns`, request);
  }

  updateTown(id: number, request: TownRequest): Observable<Town> {
    return this.http.put<Town>(`${this.apiUrl}/towns/${id}`, request);
  }

  deleteTown(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/towns/${id}`);
  }

  toggleTownActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/towns/${id}/toggle-active`, {});
  }

  toggleTownDeliveryAvailability(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/towns/${id}/toggle-delivery`, {});
  }

  // Public
  getTownById(id: number): Observable<Town> {
    return this.http.get<Town>(`${this.apiUrl}/towns/${id}`);
  }

  getTownsByBigArea(bigAreaId: number): Observable<Town[]> {
    return this.http.get<Town[]>(`${this.apiUrl}/towns/by-big-area/${bigAreaId}`);
  }

  getTownsByBigAreaPaginated(bigAreaId: number, page: number = 0, size: number = 20): Observable<PageResponse<Town>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Town>>(`${this.apiUrl}/towns/by-big-area/${bigAreaId}/paginated`, { params });
  }

  getActiveTownsByBigArea(bigAreaId: number): Observable<Town[]> {
    return this.http.get<Town[]>(`${this.apiUrl}/towns/by-big-area/${bigAreaId}/active`);
  }

  getDeliveryAvailableTowns(bigAreaId: number): Observable<Town[]> {
    return this.http.get<Town[]>(`${this.apiUrl}/towns/by-big-area/${bigAreaId}/delivery-available`);
  }

  searchTowns(keyword: string): Observable<Town[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Town[]>(`${this.apiUrl}/towns/search`, { params });
  }

  countDeliveryAddressesByTown(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/towns/${id}/address-count`);
  }

  // ========== DELIVERY ADDRESS ENDPOINTS ==========

  // Current user self endpoints
  addAddressForCurrentUser(request: DeliveryAddressRequest): Observable<DeliveryAddress> {
    return this.http.post<DeliveryAddress>(`${this.apiUrl}/users/me/addresses`, request);
  }

  getCurrentUserAddresses(): Observable<DeliveryAddress[]> {
    return this.http.get<DeliveryAddress[]>(`${this.apiUrl}/users/me/addresses`);
  }

  getCurrentUserDefaultAddress(): Observable<DeliveryAddress> {
    return this.http.get<DeliveryAddress>(`${this.apiUrl}/users/me/addresses/default`);
  }

  updateCurrentUserAddress(addressId: number, request: DeliveryAddressRequest): Observable<DeliveryAddress> {
    return this.http.put<DeliveryAddress>(`${this.apiUrl}/users/me/addresses/${addressId}`, request);
  }

  deleteCurrentUserAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/me/addresses/${addressId}`);
  }

  setDefaultAddress(addressId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/me/addresses/${addressId}/set-default`, {});
  }

  // Admin or Self endpoints
  addAddress(userId: number, request: DeliveryAddressRequest): Observable<DeliveryAddress> {
    return this.http.post<DeliveryAddress>(`${this.apiUrl}/users/${userId}/addresses`, request);
  }

  getUserAddresses(userId: number): Observable<DeliveryAddress[]> {
    return this.http.get<DeliveryAddress[]>(`${this.apiUrl}/users/${userId}/addresses`);
  }

  getDefaultAddress(userId: number): Observable<DeliveryAddress> {
    return this.http.get<DeliveryAddress>(`${this.apiUrl}/users/${userId}/addresses/default`);
  }

  updateAddress(userId: number, addressId: number, request: DeliveryAddressRequest): Observable<DeliveryAddress> {
    return this.http.put<DeliveryAddress>(`${this.apiUrl}/users/${userId}/addresses/${addressId}`, request);
  }

  deleteAddress(userId: number, addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/addresses/${addressId}`);
  }

  setDefaultAddressByUser(userId: number, addressId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${userId}/addresses/${addressId}/set-default`, {});
  }
}