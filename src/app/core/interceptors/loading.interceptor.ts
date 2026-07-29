import { Injectable, NgZone } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  
  private totalRequests = 0;

  constructor(
    private loadingService: LoadingService,
    private ngZone: NgZone
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for these endpoints
    if (this.shouldSkipLoading(req.url)) {
      return next.handle(req);
    }

    this.totalRequests++;
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.totalRequests--;
          if (this.totalRequests === 0) {
            this.loadingService.hide();
          }
        });
      })
    );
  }

  private shouldSkipLoading(url: string): boolean {
    const skipPatterns = [
      '/analytics/dashboard',
      '/analytics/sales',
      '/analytics/products',
      '/analytics/categories',
      '/analytics/geographic',
      '/analytics/sales/daily'
    ];
    
    return skipPatterns.some(pattern => url.includes(pattern));
  }
}