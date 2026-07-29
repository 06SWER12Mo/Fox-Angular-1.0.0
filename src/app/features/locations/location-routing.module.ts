import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressFormComponent } from './components/address-form/address-form.component';

const routes: Routes = [
  { path: '', component: AddressListComponent, canActivate: [AuthGuard] },
  { path: 'new', component: AddressFormComponent, canActivate: [AuthGuard] },
  { path: ':id/edit', component: AddressFormComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationRoutingModule { }