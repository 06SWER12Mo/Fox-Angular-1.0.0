import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerGuard } from '../../core/guards/manager.guard';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list.component';
import { ProductFormComponent } from './components/products/product-form.component';
import { CategoryListComponent } from './components/categories/category-list.component';
import { CategoryFormComponent } from './components/categories/category-form.component';
import { AdminOrderListComponent } from './components/orders/admin-order-list.component';
import { AdminOrderDetailComponent } from './components/orders/admin-order-detail.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AdminLocationsComponent } from './components/locations/admin-locations.component';
import { AdminAreaTownsComponent } from './components/locations/admin-area-towns.component';
import { UserListComponent } from './components/users/user-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SessionsComponent } from './components/sessions/sessions.component';
import { ReceiptListComponent } from './components/receipts/receipt-list.component';
import { ReceiptFormComponent } from './components/receipts/receipt-form.component';
import { SupplierListComponent } from './components/suppliers/supplier-list.component';
import { EmployeeListComponent } from './components/employees/employee-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [ManagerGuard],
    canActivateChild: [ManagerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/:id/edit', component: ProductFormComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/new', component: CategoryFormComponent },
      { path: 'categories/:id/edit', component: CategoryFormComponent },
      { path: 'orders', component: AdminOrderListComponent },
      { path: 'orders/:id', component: AdminOrderDetailComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'locations', component: AdminLocationsComponent },
      { path: 'locations/:areaId/towns', component: AdminAreaTownsComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/:id', component: UserDetailComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'receipts', component: ReceiptListComponent },
      { path: 'receipts/new', component: ReceiptFormComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'suppliers', component: SupplierListComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
