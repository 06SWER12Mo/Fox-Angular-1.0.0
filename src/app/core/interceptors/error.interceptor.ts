import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private tokenService: TokenService
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
              errorMessage = 'Session expired. Please login again.';
              this.tokenService.clearAll();
              this.router.navigate(['/auth/login'], { 
                queryParams: { returnUrl: this.router.url }
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

        // Simple alert fallback (remove if you don't want alerts)
        // alert(errorMessage);

        return throwError(() => error);
      })
    );
  }
}