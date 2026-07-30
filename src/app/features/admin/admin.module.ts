import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Layout
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Products
import { ProductListComponent } from './components/products/product-list.component';
import { ProductFormComponent } from './components/products/product-form.component';

// Categories
import { CategoryListComponent } from './components/categories/category-list.component';
import { CategoryFormComponent } from './components/categories/category-form.component';

// Orders
import { AdminOrderListComponent } from './components/orders/admin-order-list.component';
import { AdminOrderDetailComponent } from './components/orders/admin-order-detail.component';

// Analytics
import { AnalyticsComponent } from './components/analytics/analytics.component';

// Locations
import { AdminLocationsComponent } from './components/locations/admin-locations.component';
import { AdminAreaTownsComponent } from './components/locations/admin-area-towns.component';

// Users
import { UserListComponent } from './components/users/user-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';

// Settings
import { SettingsComponent } from './components/settings/settings.component';

// Sessions
import { SessionsComponent } from './components/sessions/sessions.component';

// Receipts
import { ReceiptListComponent } from './components/receipts/receipt-list.component';
import { ReceiptFormComponent } from './components/receipts/receipt-form.component';

// Employees
import { EmployeeListComponent } from './components/employees/employee-list.component';

// Suppliers
import { SupplierListComponent } from './components/suppliers/supplier-list.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    ProductListComponent,
    ProductFormComponent,
    CategoryListComponent,
    CategoryFormComponent,
    AdminOrderListComponent,
    AdminOrderDetailComponent,
    AnalyticsComponent,
    AdminLocationsComponent,
    AdminAreaTownsComponent,
    UserListComponent,
    UserDetailComponent,
    SettingsComponent,
    SessionsComponent,
    ReceiptListComponent,
    ReceiptFormComponent,
    EmployeeListComponent,
    SupplierListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    SharedModule,
  ],
})
export class AdminModule { }
