import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthModalService } from '../services/auth-modal.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private authModalService: AuthModalService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Bad Request';
              if (error.error?.validationErrors) {
                const validationMessages = Object.values(error.error.validationErrors).join(', ');
                errorMessage = `Validation failed: ${validationMessages}`;
              }
              break;
            case 401:
              // A 401 from the login/register endpoints means the credentials were
              // rejected — the form shows a friendly inline error, so do NOT treat
              // it as a session expiry and do NOT pop up the auth modal on top.
              if (this.isAuthEndpoint(req.url)) {
                break;
              }
              errorMessage = 'Session expired. Please login again.';
              this.tokenService.clearAll();
              // Open the auth modal popup — after login, redirect MANAGER/ADMIN users
              this.authModalService.open('login').subscribe(result => {
                if (result?.success) {
                  const role = this.tokenService.getUserRole();
                  if (role === 'MANAGER' || role === 'ADMIN') {
                    window.location.href = '/admin/dashboard';
                  }
                }
              });
              break;
            case 403:
              errorMessage = error.error?.message || 'You do not have permission to access this resource';
              break;
            case 404:
              errorMessage = error.error?.message || 'Resource not found';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflict with existing data';
              break;
            case 422:
              errorMessage = error.error?.message || 'Unprocessable entity';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service unavailable. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: error.message,
          error: error.error,
          url: req.url
        });

        return throwError(() => error);
      })
    );
  }

  /** True for the login/register endpoints, where a 401 means 'bad credentials' rather than an expired session. */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') ||
           url.includes('/auth/register');
  }
}