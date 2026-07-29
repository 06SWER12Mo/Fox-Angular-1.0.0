import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserUpdateRequest, UserRequest } from '../../models/user.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // ========== USER ENDPOINTS ==========

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateCurrentUser(request: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request);
  }

  deleteCurrentUser(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }

  // ========== ADMIN OR SELF ENDPOINTS ==========

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUserById(id: number, request: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  deleteUserById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== ADMIN ONLY ENDPOINTS ==========

  getAllUsers(page: number = 0, size: number = 20): Observable<PageResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<User>>(this.apiUrl, { params });
  }

  enableUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/enable`, {});
  }

  disableUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/disable`, {});
  }

  lockUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/lock`, {});
  }

  unlockUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/unlock`, {});
  }

  verifyUserEmail(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/verify`, {});
  }

  requestEmailVerification(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/request-verification`, {});
  }

  cancelEmailVerification(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/request-verification`);
  }

  updateUserRole(id: number, role: string): Observable<void> {
    const params = new HttpParams().set('role', role);
    return this.http.put<void>(`${this.apiUrl}/${id}/role`, null, { params });
  }

  // ========== STATISTICS ==========

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`);
  }

  getActiveUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/active`);
  }

  getUsersRegisteredBetween(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<number>(`${this.apiUrl}/stats/registered`, { params });
  }
}