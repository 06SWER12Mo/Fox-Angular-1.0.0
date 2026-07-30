import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../../core/services/token.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { Router } from '@angular/router';
import { UserProfile } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false
})
export class AdminLayoutComponent implements OnInit {
  user: UserProfile | null = null;
  isSidebarOpen = false;
  currentPage = '';
  notificationCount = 0;

  navItems = [
    { path: '/admin/dashboard', icon: 'grid', label: 'Dashboard' },
    { path: '/admin/products', icon: 'package', label: 'Products' },
    { path: '/admin/categories', icon: 'folder', label: 'Categories' },
    { path: '/admin/orders', icon: 'shopping-cart', label: 'Orders' },
    { path: '/admin/receipts', icon: 'file-text', label: 'Receipts' },
    { path: '/admin/suppliers', icon: 'truck', label: 'Suppliers' },
    { path: '/admin/analytics', icon: 'trending-up', label: 'Analytics' },
    { path: '/admin/locations', icon: 'map-pin', label: 'Areas & Towns' },
    { path: '/admin/employees', icon: 'users', label: 'Employees' },
    { path: '/admin/users', icon: 'users', label: 'Users' },
    { path: '/admin/sessions', icon: 'activity', label: 'Sessions' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.tokenService.getUserData();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  getInitials(): string {
    if (!this.user) return 'M';
    const f = this.user.firstName?.[0] || '';
    const l = this.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || this.user.username[0].toUpperCase();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => window.location.href = '/',
      error: () => { this.tokenService.clearAll(); window.location.href = '/'; }
    });
  }


}
