import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.tokenService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/profile']);
    }
    return true;
  }
}