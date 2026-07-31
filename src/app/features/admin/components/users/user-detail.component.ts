import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/api/user.service';
import { OrderService } from '../../../../core/services/api/order.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['../orders/admin-order-detail.component.scss', './user-detail.component.scss'],
  standalone: false
})
export class UserDetailComponent implements OnInit {
  user: any = null;
  orders: any[] = [];
  isLoading = true;

  // Role change
  showRoleModal = false;
  selectedRole = 'USER';
  isSavingRole = false;
  roleConfirmText = '';

  // Delete confirmation
  confirmDelete = false;

  // Avatar image fallback (broken image falls back to initials)
  avatarImgError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) this.loadUser(+params['id']);
    });
  }

  loadUser(id: number): void {
    this.isLoading = true;
    // Reset avatar error so a newly loaded/fixed profile picture gets a chance to render
    this.avatarImgError = false;
    this.userService.getUserById(id).pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.loadOrders(id);
      },
      error: () => this.router.navigate(['/admin/users'])
    });
  }

  loadOrders(userId: number): void {
    this.orderService.getOrdersByUser(userId).subscribe({
      next: (res: any) => {
        this.orders = Array.isArray(res) ? res : res?.content || [];
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  // ========== AVATAR ==========

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  onAvatarError(): void {
    this.avatarImgError = true;
    this.cdr.detectChanges();
  }

  // ========== ENABLE / DISABLE ==========

  toggleEnabled(): void {
    if (!this.user) return;
    const obs = this.user.enabled !== false
      ? this.userService.disableUser(this.user.id)
      : this.userService.enableUser(this.user.id);
    obs.subscribe({ next: () => this.loadUser(this.user.id) });
  }

  // ========== LOCK / UNLOCK ==========

  toggleLock(): void {
    if (!this.user) return;
    const obs = this.user.locked
      ? this.userService.unlockUser(this.user.id)
      : this.userService.lockUser(this.user.id);
    obs.subscribe({ next: () => this.loadUser(this.user.id) });
  }

  // ========== VERIFY EMAIL ==========

  verifyEmail(): void {
    if (!this.user) return;
    this.userService.verifyUserEmail(this.user.id).subscribe({
      next: () => this.loadUser(this.user.id)
    });
  }

  // ========== ROLE CHANGE ==========

  openRoleModal(): void {
    if (!this.user) return;
    this.selectedRole = this.user.role || 'USER';
    this.showRoleModal = true;
    this.roleConfirmText = '';
    this.cdr.detectChanges();
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.roleConfirmText = '';
  }

  saveRole(): void {
    if (!this.user) return;
    if (this.roleConfirmText.trim().toLowerCase() !== 'confirm') {
      return;
    }
    this.isSavingRole = true;
    this.userService.updateUserRole(this.user.id, this.selectedRole).pipe(
      finalize(() => { this.isSavingRole = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeRoleModal(); this.loadUser(this.user.id); },
      error: () => alert('Failed to update role')
    });
  }

  // ========== DELETE ==========

  requestDelete(): void {
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.confirmDelete = false;
  }

  confirmDeleteAction(): void {
    if (!this.user) return;
    this.userService.deleteUserById(this.user.id).subscribe({
      next: () => { this.confirmDelete = false; this.router.navigate(['/admin/users']); },
      error: () => { this.confirmDelete = false; alert('Failed to delete user'); }
    });
  }
}
