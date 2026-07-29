import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Product, 
  ProductRequest, 
  ProductSearchRequest, 
  ProductSummary,
  ProductVariant,
  ProductVariantRequest 
} from '../../models/product.model';
import { PageResponse, Image } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // ========== PUBLIC ENDPOINTS ==========

  getAllProducts(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductSummary(id: number): Observable<ProductSummary> {
    return this.http.get<ProductSummary>(`${this.apiUrl}/${id}/summary`);
  }

  searchProducts(keyword: string, page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  advancedSearch(request: ProductSearchRequest): Observable<PageResponse<Product>> {
    return this.http.post<PageResponse<Product>>(`${this.apiUrl}/search/advanced`, request);
  }

  getProductsByCategory(categoryId: number, page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/category/${categoryId}`, { params });
  }

  getActiveProductsByCategory(categoryId: number, page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/category/${categoryId}/active`, { params });
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  getFeaturedProductsPaginated(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/featured/paginated`, { params });
  }

  getInStockProducts(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/in-stock`, { params });
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number, page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/price-range`, { params });
  }

  getDiscountedProducts(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/on-sale`, { params });
  }

  getTopRatedProducts(page: number = 0, size: number = 10): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/top-rated`, { params });
  }

  getNewArrivals(page: number = 0, size: number = 10): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/new-arrivals`, { params });
  }

  getBestSellers(page: number = 0, size: number = 10): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/best-sellers`, { params });
  }

  getMostViewed(page: number = 0, size: number = 10): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/most-viewed`, { params });
  }

  // ========== ADMIN/MANAGER ENDPOINTS ==========

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  toggleFeatured(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-featured`, {});
  }

  updateStock(id: number, quantity: number): Observable<void> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.patch<void>(`${this.apiUrl}/${id}/stock`, null, { params });
  }

  incrementStock(id: number, quantity: number): Observable<void> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.post<void>(`${this.apiUrl}/${id}/increment-stock`, null, { params });
  }

  decrementStock(id: number, quantity: number): Observable<void> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.post<void>(`${this.apiUrl}/${id}/decrement-stock`, null, { params });
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  getLowStockProductsPaginated(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/low-stock/paginated`, { params });
  }

  // ========== SPECIFICATION MANAGEMENT ==========

  addSpecification(productId: number, request: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${productId}/specifications`, request);
  }

  updateSpecification(specificationId: number, request: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/specifications/${specificationId}`, request);
  }

  removeSpecification(specificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/specifications/${specificationId}`);
  }

  // ========== VARIANT MANAGEMENT ==========

  addVariant(productId: number, request: ProductVariantRequest): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.apiUrl}/${productId}/variants`, request);
  }

  updateVariant(variantId: number, request: ProductVariantRequest): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.apiUrl}/variants/${variantId}`, request);
  }

  removeVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/variants/${variantId}`);
  }

  // ========== STATISTICS ==========

  getTotalProductCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`);
  }

  getActiveProductCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count/active`);
  }

  getProductCountByCategory(categoryId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count/category/${categoryId}`);
  }
}