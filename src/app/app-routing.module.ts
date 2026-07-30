import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //  Default route - Home page
  {
    path: '',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  
  // Auth - Public
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Products - Public
  {
    path: 'products',
    loadChildren: () => import('./features/products/product.module').then(m => m.ProductModule)
  },
  
  // Categories - Public
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/category.module').then(m => m.CategoryModule)
  },
  
  // Cart - Protected
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule)
  },
  
  // Checkout - Protected
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule)
  },
  
  // Orders - Protected
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/order.module').then(m => m.OrderModule)
  },
  
  // Reviews
  {
    path: 'reviews',
    loadChildren: () => import('./features/reviews/review.module').then(m => m.ReviewModule)
  },
  
  // Locations - Protected
  {
    path: 'locations',
    loadChildren: () => import('./features/locations/location.module').then(m => m.LocationModule)
  },
  
  // Admin - Manager/Admin only
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  
  //  Fallback - redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 0]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }