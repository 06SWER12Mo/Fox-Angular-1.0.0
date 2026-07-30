import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.auth.refreshTokenKey;
  private readonly USER_KEY = environment.auth.userKey;

  private userDataSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly userData$: Observable<UserProfile | null> = this.userDataSubject.asObservable();

  constructor() {
    // Emit initial user data on creation
    this.userDataSubject.next(this.getUserData());
  }

  // ========== ACCESS TOKEN ==========
  
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeAccessToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ========== REFRESH TOKEN ==========

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // ========== USER DATA ==========

  getUserData(): UserProfile | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userDataSubject.next(user);
  }

  removeUserData(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userDataSubject.next(null);
  }

  // ========== AUTH STATUS ==========

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;
      
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (error) {
      return true;
    }
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // ========== USER INFO FROM TOKEN ==========

  getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    return payload?.userId || null;
  }

  getUserEmail(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    return payload?.email || null;
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    let role = payload?.role || null;
    // Backend stores ROLE_MANAGER, ROLE_ADMIN, ROLE_USER in the JWT (with ROLE_ prefix
    // from Spring Security's SimpleGrantedAuthority). Strip the prefix so the rest of
    // the app can compare against 'MANAGER', 'ADMIN', 'USER' directly.
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
    }
    return role;
  }

  getUsername(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    return payload?.sub || null;
  }

  // ========== ROLE CHECKS ==========

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN';
  }

  isManager(): boolean {
    const role = this.getUserRole();
    return role === 'MANAGER';
  }

  isUser(): boolean {
    const role = this.getUserRole();
    return role === 'USER';
  }

  isManagerOrHigher(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN' || role === 'MANAGER';
  }

  // ========== CLEAR ALL ==========

  clearAll(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUserData();
  }
}