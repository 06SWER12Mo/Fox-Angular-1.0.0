import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  CanLoad, 
  UrlTree,
  Route,
  UrlSegment
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthModalService } from '../services/auth-modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  
  constructor(
    private tokenService: TokenService,
    private authModalService: AuthModalService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  private checkAuth(): boolean | UrlTree {
    if (this.tokenService.isAuthenticated()) {
      // Authenticated — allow the guard to pass.
      // CustomerGuard (applied on the same route) will block MANAGER/ADMIN
      // from customer-only pages and redirect them to /admin/dashboard.
      return true;
    }
    
    // Open the auth modal popup — after login, redirect MANAGER/ADMIN users
    this.authModalService.open('login').subscribe(result => {
      if (result?.success) {
        const role = this.tokenService.getUserRole();
        if (role === 'MANAGER' || role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        }
      }
    });
    return false;
  }
}