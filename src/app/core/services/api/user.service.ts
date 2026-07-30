import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, UserUpdateRequest, UserRequest } from '../../models/user.model';
import { ApiResponse, PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** Unwrap the backend's ApiResponse wrapper: extract `.data` if present */
  private unwrap<T>(obs: Observable<any>): Observable<T> {
    return obs.pipe(map((res: any) => res?.data ?? res));
  }

  // ========== USER ENDPOINTS ==========

  getCurrentUser(): Observable<User> {
    return this.unwrap<User>(this.http.get(`${this.apiUrl}/me`));
  }

  updateCurrentUser(request: UserUpdateRequest): Observable<User> {
    return this.unwrap<User>(this.http.put(`${this.apiUrl}/me`, request));
  }

  deleteCurrentUser(): Observable<void> {
    return this.unwrap<void>(this.http.delete(`${this.apiUrl}/me`));
  }

  // ========== ADMIN OR SELF ENDPOINTS ==========

  getUserById(id: number): Observable<User> {
    return this.unwrap<User>(this.http.get(`${this.apiUrl}/${id}`));
  }

  updateUserById(id: number, request: UserUpdateRequest): Observable<User> {
    return this.unwrap<User>(this.http.put(`${this.apiUrl}/${id}`, request));
  }

  deleteUserById(id: number): Observable<void> {
    return this.unwrap<void>(this.http.delete(`${this.apiUrl}/${id}`));
  }

  // ========== ADMIN ONLY ENDPOINTS ==========

  getAllUsers(page: number = 0, size: number = 20): Observable<PageResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<User>>(this.http.get(this.apiUrl, { params }));
  }

  enableUser(id: number): Observable<void> {
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/enable`, {}));
  }

  disableUser(id: number): Observable<void> {
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/disable`, {}));
  }

  lockUser(id: number): Observable<void> {
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/lock`, {}));
  }

  unlockUser(id: number): Observable<void> {
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/unlock`, {}));
  }

  verifyUserEmail(id: number): Observable<void> {
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/verify`, {}));
  }

  requestEmailVerification(): Observable<void> {
    return this.unwrap<void>(this.http.post(`${this.apiUrl}/me/request-verification`, {}));
  }

  cancelEmailVerification(): Observable<void> {
    return this.unwrap<void>(this.http.delete(`${this.apiUrl}/me/request-verification`));
  }

  updateUserRole(id: number, role: string): Observable<void> {
    const params = new HttpParams().set('role', role);
    return this.unwrap<void>(this.http.put(`${this.apiUrl}/${id}/role`, null, { params }));
  }

  // ========== STATISTICS ==========

  getTotalUsers(): Observable<number> {
    return this.unwrap<number>(this.http.get(`${this.apiUrl}/stats/count`));
  }

  getActiveUsers(): Observable<number> {
    return this.unwrap<number>(this.http.get(`${this.apiUrl}/stats/active`));
  }

  getUsersRegisteredBetween(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.unwrap<number>(this.http.get(`${this.apiUrl}/stats/registered`, { params }));
  }
}