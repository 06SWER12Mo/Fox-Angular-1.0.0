import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn: 'root' })
export class CustomerGuard implements CanActivate, CanActivateChild {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkCustomerOnly();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkCustomerOnly();
  }

  private checkCustomerOnly(): boolean | UrlTree {
    // Not authenticated → let AuthGuard handle the modal prompt
    if (!this.tokenService.isAuthenticated()) {
      return true;
    }

    // MANAGER or ADMIN → redirect to admin dashboard
    const role = this.tokenService.getUserRole();
    if (role === 'MANAGER' || role === 'ADMIN') {
      return this.router.createUrlTree(['/admin/dashboard']);
    }

    // Regular USER → allow access
    return true;
  }
}
