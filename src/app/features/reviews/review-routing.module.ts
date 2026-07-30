import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { CustomerGuard } from '../../core/guards/customer.guard';

import { ReviewListComponent } from './components/review-list/review-list.component';

const routes: Routes = [
  { path: 'product/:productId', component: ReviewListComponent },
  { path: 'my-reviews', component: ReviewListComponent, canActivate: [AuthGuard, CustomerGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewRoutingModule { }