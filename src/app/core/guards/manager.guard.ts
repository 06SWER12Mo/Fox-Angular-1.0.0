import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, UrlTree, Route, UrlSegment, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn: 'root' })
export class ManagerGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  private checkAuth(): boolean | UrlTree {
    if (!this.tokenService.isAuthenticated()) {
      return this.router.createUrlTree(['/']);
    }
    const role = this.tokenService.getUserRole();
    if (role === 'MANAGER' || role === 'ADMIN') {
      return true;
    }
    return this.router.createUrlTree(['/']);
  }
}
