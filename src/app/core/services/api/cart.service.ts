import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../../models/cart.model';
import { ApiResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // FIX: shared cart-count state. Any component that mutates the cart
  // pushes the new count here; any component that displays the count
  // (e.g. the header badge) just subscribes — no more relying on
  // router navigation events to "accidentally" refresh it.
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  // Cart data cache — allows the cart page to show items instantly
  // on navigation instead of waiting for a fresh HTTP response.
  private cartCache = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartCache.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Returns the full ApiResponse and updates the cache
  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap(response => this.updateCache(response.data))
    );
  }

  // ✅ Returns cached cart immediately (or null if never fetched)
  getCachedCart(): Cart | null {
    return this.cartCache.getValue();
  }

  // ✅ Helper method that returns just the data
  getCartData(): Observable<Cart> {
    return this.getCart().pipe(
      map(response => response.data)
    );
  }

  addToCart(request: AddToCartRequest): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/add`, request).pipe(
      tap(response => this.updateCache(response.data))
    );
  }

  updateCartItem(request: UpdateCartItemRequest): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/update`, request).pipe(
      tap(response => this.updateCache(response.data))
    );
  }

  removeFromCart(productId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/remove/${productId}`).pipe(
      tap(response => this.updateCache(response.data))
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/clear`).pipe(
      tap(() => {
        this.cartItemCountSubject.next(0);
        this.cartCache.next(this.buildEmptyCart());
      })
    );
  }

  getCartItemCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`).pipe(
      tap(response => this.cartItemCountSubject.next(response.data || 0))
    );
  }

  getCartByUserId(userId: number): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${this.apiUrl}/user/${userId}`);
  }

  /** Update both the count and the cached cart data after a mutation. */
  private updateCache(cart: Cart): void {
    if (!cart) return;
    this.updateCountFromCart(cart);
    this.cartCache.next(cart);
  }

  /** Build an empty cart for after clearCart. */
  private buildEmptyCart(): Cart {
    return { id: 0, userEmail: '', items: [], totalPrice: 0 };
  }

  // Called whenever the server returns a fresh Cart after a mutation,
  // so the badge updates immediately without a second round trip.
  private updateCountFromCart(cart: Cart): void {
    if (!cart || !cart.items) return;
    const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(total);
  }

  // Call this on login, or anywhere you want to force a re-sync with the server
  // (e.g. after switching accounts).
  refreshCartCount(): void {
    this.getCartItemCount().subscribe({
      error: () => this.cartItemCountSubject.next(0)
    });
  }

  // Call this on logout so the badge doesn't keep showing a stale count.
  resetCartCount(): void {
    this.cartItemCountSubject.next(0);
    this.cartCache.next(null);
  }

  // Clear in-memory cart cache (call on logout)
  clearCache(): void {
    this.cartCache.next(null);
  }
}