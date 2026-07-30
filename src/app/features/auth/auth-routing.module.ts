import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

import { AuthGuard } from '../../core/guards/auth.guard';
import { NoAuthGuard } from '../../core/guards/no-auth.guard';
import { CustomerGuard } from '../../core/guards/customer.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [NoAuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }