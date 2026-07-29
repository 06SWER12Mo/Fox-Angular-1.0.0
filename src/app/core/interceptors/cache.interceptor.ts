import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, any>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Skip caching for these endpoints
    if (this.shouldSkipCache(req.url)) {
      return next.handle(req);
    }

    const cacheKey = req.urlWithParams;
    const cachedResponse = this.cache.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(cacheKey, event);
        }
      }),
      shareReplay(1)
    );
  }

  private shouldSkipCache(url: string): boolean {
    const skipPatterns = [
      '/auth',
      '/cart',
      '/orders',
      '/payments',
      '/checkout'
    ];
    return skipPatterns.some(pattern => url.includes(pattern));
  }

  clearCache(): void {
    this.cache.clear();
  }
}