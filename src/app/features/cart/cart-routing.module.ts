import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { CustomerGuard } from '../../core/guards/customer.guard';

import { CartViewComponent } from './components/cart-view/cart-view.component';

const routes: Routes = [
  { path: '', component: CartViewComponent, canActivate: [AuthGuard, CustomerGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }