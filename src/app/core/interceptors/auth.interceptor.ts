import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/api/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for auth endpoints (except refresh)
    if (this.isAuthEndpoint(req.url) && !req.url.includes('/refresh')) {
      return next.handle(req);
    }

    const token = this.tokenService.getAccessToken();
    let authReq = req;

    if (token) {
      authReq = this.addTokenToRequest(req, token);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || 
           url.includes('/auth/register') || 
           url.includes('/auth/refresh');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.tokenService.setAccessToken(response.accessToken);
            this.refreshTokenSubject.next(response.accessToken);
            
            return next.handle(this.addTokenToRequest(request, response.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.tokenService.clearAll();
            // FIX: Complete the subject to unblock any requests waiting on it.
            // Without this, waiting requests would hang forever (infinite loading).
            this.refreshTokenSubject.complete();
            this.refreshTokenSubject = new BehaviorSubject<string | null>(null);
            return throwError(() => error);
          })
        );
      }

      this.isRefreshing = false;
      this.tokenService.clearAll();
      this.refreshTokenSubject.complete();
      this.refreshTokenSubject = new BehaviorSubject<string | null>(null);
      return throwError(() => new Error('No refresh token available'));
    } else {
      // Another request is already refreshing - wait for it.
      // filter: skip the initial null value so we don't immediately error
      // first: when the subject completes (on refresh failure), emit EmptyError
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        first(),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token!));
        })
      );
    }
  }
}