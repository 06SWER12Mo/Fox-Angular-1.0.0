import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

// Services
import { TokenService } from './services/token.service';
import { LoadingService } from './services/loading.service';

// API Services
import { AuthService } from './services/api/auth.service';
import { ProductService } from './services/api/product.service';
import { CategoryService } from './services/api/category.service';
import { CartService } from './services/api/cart.service';
import { OrderService } from './services/api/order.service';
import { PaymentService } from './services/api/payment.service';
import { ReviewService } from './services/api/review.service';
import { LocationService } from './services/api/location.service';
import { StoreService } from './services/api/store.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services
    TokenService,
    LoadingService,
    AuthService,
    ProductService,
    CategoryService,
    CartService,
    OrderService,
    PaymentService,
    ReviewService,
    LocationService,
    StoreService,
    
    // Interceptors (order matters!)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}