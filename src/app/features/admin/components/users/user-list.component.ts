import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/api/user.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['../products/product-list.component.scss', './user-list.component.scss'],
  standalone: false
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  errorMessage: string | null = null;

  // Role change modal
  showRoleModal = false;
  roleUser: any = null;
  selectedRole = 'USER';
  isSavingRole = false;
  roleConfirmText = '';

  // Delete confirmation
  confirmDelete: any = null;

  // Avatar image fallbacks (per user, so a broken image falls back to initials)
  private avatarErrors = new Set<number>();

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.applyFilter();
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter((u: any) =>
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.lastName || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Reset avatar error flags so fixed/updated profile pictures get another chance to render
    this.avatarErrors.clear();
    this.userService.getAllUsers(this.currentPage, 20).pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        console.log('[Admin Users] API response:', res);
        this.users = res?.content || [];
        this.totalPages = res?.totalPages || 1;
        this.totalElements = res?.totalElements || 0;
        this.applyFilter();
      },
      error: (err: any) => {
        console.error('[Admin Users] Failed to load users:', err);
        if (err.status === 403) {
          this.errorMessage = 'You do not have permission to manage users. Admin role may be required.';
        } else if (err.status === 401) {
          this.errorMessage = 'Your session has expired. Please log in again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server. Please check your connection.';
        } else {
          this.errorMessage = err.error?.message || `Failed to load users (Error ${err.status})`;
        }
        this.users = [];
        this.totalPages = 0;
        this.totalElements = 0;
        this.filteredUsers = [];
      }
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  viewUser(id: number): void {
    this.router.navigate(['/admin/users', id]);
  }

  // ========== AVATAR ==========

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  avatarFailed(userId: number): boolean {
    return this.avatarErrors.has(userId);
  }

  onAvatarError(user: any): void {
    this.avatarErrors.add(user.id);
    this.cdr.detectChanges();
  }

  // ========== ENABLE / DISABLE ==========

  toggleEnabled(user: any): void {
    const obs = user.enabled !== false
      ? this.userService.disableUser(user.id)
      : this.userService.enableUser(user.id);
    obs.subscribe({ next: () => this.loadUsers() });
  }

  // ========== LOCK / UNLOCK ==========

  toggleLock(user: any): void {
    const obs = user.locked
      ? this.userService.unlockUser(user.id)
      : this.userService.lockUser(user.id);
    obs.subscribe({ next: () => this.loadUsers() });
  }

  // ========== VERIFY EMAIL ==========

  verifyEmail(user: any): void {
    this.userService.verifyUserEmail(user.id).subscribe({ next: () => this.loadUsers() });
  }

  // ========== ROLE CHANGE ==========

  openRoleModal(user: any): void {
    this.roleUser = user;
    this.selectedRole = user.role || 'USER';
    this.showRoleModal = true;
    this.roleConfirmText = '';
    this.cdr.detectChanges();
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.roleUser = null;
    this.roleConfirmText = '';
  }

  saveRole(): void {
    if (!this.roleUser) return;
    if (this.roleConfirmText.trim().toLowerCase() !== 'confirm') {
      return;
    }
    this.isSavingRole = true;
    this.userService.updateUserRole(this.roleUser.id, this.selectedRole).pipe(
      finalize(() => { this.isSavingRole = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeRoleModal(); this.loadUsers(); },
      error: () => alert('Failed to update role')
    });
  }

  // ========== DELETE ==========

  requestDelete(user: any): void {
    this.confirmDelete = user;
  }

  cancelDelete(): void {
    this.confirmDelete = null;
  }

  confirmDeleteAction(): void {
    if (!this.confirmDelete) return;
    const id = this.confirmDelete.id;
    this.userService.deleteUserById(id).subscribe({
      next: () => { this.confirmDelete = null; this.loadUsers(); },
      error: () => { this.confirmDelete = null; alert('Failed to delete user'); }
    });
  }
}
