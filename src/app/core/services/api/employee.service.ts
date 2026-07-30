import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Employee, EmployeeRequest, EmployeeStats } from '../../models/employee.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  /** Unwrap the backend's ApiResponse wrapper */
  private unwrap<T>(obs: Observable<any>): Observable<T> {
    return obs.pipe(map((res: any) => res?.data ?? res));
  }

  // ========== CREATE ==========

  createEmployee(request: EmployeeRequest): Observable<Employee> {
    return this.unwrap<Employee>(this.http.post(this.apiUrl, request));
  }

  // ========== UPDATE ==========

  updateEmployee(id: number, request: EmployeeRequest): Observable<Employee> {
    return this.unwrap<Employee>(this.http.put(`${this.apiUrl}/${id}`, request));
  }

  // ========== DELETE ==========

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== TOGGLE ==========

  toggleEmployeeActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  // ========== GET BY ID ==========

  getEmployeeById(id: number): Observable<Employee> {
    return this.unwrap<Employee>(this.http.get(`${this.apiUrl}/${id}`));
  }

  getEmployeeByPassportNumber(passportNumber: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/passport/${passportNumber}`);
  }

  getEmployeeByEmail(email: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/email/${email}`);
  }

  // ========== GET ALL ==========

  getAllEmployees(page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(this.apiUrl, { params }));
  }

  getActiveEmployees(page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/active`, { params }));
  }

  getInactiveEmployees(page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/inactive`, { params }));
  }

  // ========== SEARCH ==========

  searchEmployeesByName(name: string, page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/search/name`, { params }));
  }

  searchEmployeesByRole(role: string, page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('role', role)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/search/role`, { params }));
  }

  searchEmployeesByNameAndRole(name: string, role: string, page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('name', name || '')
      .set('role', role || '')
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/search/name-role`, { params }));
  }

  searchEmployees(keyword: string, page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/search`, { params }));
  }

  // ========== ROLE BASED ==========

  getEmployeesByRole(role: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/role/${role}`);
  }

  getEmployeesByRolePaginated(role: string, page: number = 0, size: number = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.unwrap<PageResponse<Employee>>(this.http.get(`${this.apiUrl}/role/${role}/paginated`, { params }));
  }

  getActiveEmployeesByRole(role: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/role/${role}/active`);
  }

  // ========== STATISTICS ==========

  getEmployeeStats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.apiUrl}/stats/count`);
  }
}