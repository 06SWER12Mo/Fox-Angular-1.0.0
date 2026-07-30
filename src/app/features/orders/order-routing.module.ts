import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { CustomerGuard } from '../../core/guards/customer.guard';

import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';

const routes: Routes = [
  { path: '', component: OrderListComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: ':id', component: OrderDetailComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: 'track/:trackingCode', component: OrderTrackingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }