import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    console.log(`🚀 Request: ${req.method} ${req.url}`);

    // Log request body if exists (for debugging)
    if (req.body) {
      console.log('📦 Request Body:', req.body);
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          console.log(`✅ Response: ${req.method} ${req.url} - ${Date.now() - startTime}ms`);
        },
        error: (error) => {
          console.error(`❌ Error: ${req.method} ${req.url} - ${Date.now() - startTime}ms`);
          console.error(error);
        }
      })
    );
  }
}