import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/api/auth.service';
import { UserProfile } from '../../../core/models/auth.model';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  standalone: false
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  avatarImgError = false;
  private sub!: Subscription;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.tokenService.getUserData();
    this.sub = this.tokenService.userData$.subscribe(u => {
      this.user = u;
      // Reset avatar error so a newly uploaded/fixed profile picture gets a fresh render attempt
      this.avatarImgError = false;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getInitials(): string {
    if (!this.user) return 'A';
    const f = this.user.firstName?.[0] || '';
    const l = this.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || this.user.username[0].toUpperCase();
  }

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  onAvatarError(): void {
    this.avatarImgError = true;
  }

  getRoleLabel(): string {
    if (!this.user) return '';
    return this.user.role === 'ADMIN' ? 'Administrator' : 'Manager';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => window.location.href = '/',
      error: () => { this.tokenService.clearAll(); window.location.href = '/'; }
    });
  }
}
