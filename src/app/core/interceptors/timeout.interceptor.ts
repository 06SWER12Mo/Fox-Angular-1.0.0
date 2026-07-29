import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

/**
 * Timeout Interceptor
 * 
 * Prevents HTTP requests from hanging indefinitely by cancelling them
 * after a configurable timeout period. This acts as a safety net for:
 * - Backend being down/unreachable
 * - Network connectivity issues
 * - Stale auth tokens causing deadlocks (defense in depth)
 * - Any unexpected scenario where a request never completes
 */
@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  // 15 seconds should be enough for most API calls
  private readonly DEFAULT_TIMEOUT = 15_000;

  // Longer timeout for file uploads / heavy operations
  private readonly UPLOAD_TIMEOUT = 60_000;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutDuration = this.isUploadRequest(req) ? this.UPLOAD_TIMEOUT : this.DEFAULT_TIMEOUT;

    return next.handle(req).pipe(
      timeout(timeoutDuration),
      catchError(error => {
        if (error instanceof TimeoutError) {
          console.error(`Request timed out after ${timeoutDuration}ms:`, req.url);
        }
        return throwError(() => error);
      })
    );
  }

  private isUploadRequest(req: HttpRequest<any>): boolean {
    return req.url.includes('/upload') || 
           req.url.includes('/images') ||
           req.body instanceof FormData;
  }
}
