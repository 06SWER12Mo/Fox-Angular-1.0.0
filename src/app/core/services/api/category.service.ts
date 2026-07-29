import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryRequest, SubCategory, SubCategoryRequest } from '../../models/category.model';
import { PageResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private subApiUrl = `${environment.apiUrl}/subcategories`;

  constructor(private http: HttpClient) {}

  // ========== PUBLIC ENDPOINTS ==========

  getAllCategories(page: number = 0, size: number = 20): Observable<PageResponse<Category>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Category>>(this.apiUrl, { params });
  }

  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/root`);
  }

  getActiveRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/root/active`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getSubCategories(parentId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${parentId}/subcategories`);
  }

  getActiveSubCategories(parentId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${parentId}/subcategories/active`);
  }

  searchCategories(keyword: string): Observable<Category[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Category[]>(`${this.apiUrl}/search`, { params });
  }

  countSubCategories(parentId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${parentId}/count`);
  }

  categoryExists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`);
  }

  // ========== ADMIN/MANAGER ENDPOINTS ==========

  createCategory(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleCategoryActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  updateCategoryDisplayOrder(id: number, displayOrder: number): Observable<void> {
    const params = new HttpParams().set('displayOrder', displayOrder.toString());
    return this.http.patch<void>(`${this.apiUrl}/${id}/display-order`, null, { params });
  }

  // ========== SUB-CATEGORY ENDPOINTS ==========

  // Admin
  createSubCategory(request: SubCategoryRequest): Observable<SubCategory> {
    return this.http.post<SubCategory>(this.subApiUrl, request);
  }

  updateSubCategory(id: number, request: SubCategoryRequest): Observable<SubCategory> {
    return this.http.put<SubCategory>(`${this.subApiUrl}/${id}`, request);
  }

  deleteSubCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.subApiUrl}/${id}`);
  }

  toggleSubCategoryActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.subApiUrl}/${id}/toggle-active`, {});
  }

  // Public
  getAllSubCategories(page: number = 0, size: number = 20): Observable<PageResponse<SubCategory>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<SubCategory>>(this.subApiUrl, { params });
  }

  getSubCategoryById(id: number): Observable<SubCategory> {
    return this.http.get<SubCategory>(`${this.subApiUrl}/${id}`);
  }

  getSubCategoriesByParent(parentId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.subApiUrl}/parent/${parentId}`);
  }

  getActiveSubCategoriesByParent(parentId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.subApiUrl}/parent/${parentId}/active`);
  }

  getSubCategoriesByParentPaginated(parentId: number, page: number = 0, size: number = 20): Observable<PageResponse<SubCategory>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<SubCategory>>(`${this.subApiUrl}/parent/${parentId}/paginated`, { params });
  }

  searchSubCategories(keyword: string): Observable<SubCategory[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<SubCategory[]>(`${this.subApiUrl}/search`, { params });
  }

  countSubCategoriesByParent(parentId: number): Observable<number> {
    return this.http.get<number>(`${this.subApiUrl}/parent/${parentId}/count`);
  }
}