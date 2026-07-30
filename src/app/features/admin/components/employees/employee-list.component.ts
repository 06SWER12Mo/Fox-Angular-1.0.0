import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../../core/services/api/employee.service';
import { debounceTime, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['../products/product-list.component.scss', './employee-list.component.scss'],
  standalone: false
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  // Filters
  searchQuery = '';
  salaryMin: number | null = null;
  salaryMax: number | null = null;
  activeFilter: string = ''; // '', 'active', 'inactive'

  private searchSubject = new Subject<string>();

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    // Debounced search for the name input only — triggers API re-fetch
    this.searchSubject.pipe(debounceTime(350)).subscribe(() => {
      this.currentPage = 0;
      this.loadEmployees();
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSalaryOrStatusChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const hasNameFilter = this.searchQuery.trim().length > 0;

    const obs = hasNameFilter
      ? this.employeeService.searchEmployeesByName(this.searchQuery.trim(), this.currentPage, this.pageSize)
      : this.employeeService.getAllEmployees(this.currentPage, this.pageSize);

    obs.pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.employees = data?.content || data || [];
        this.totalPages = data?.totalPages || 1;
        this.totalElements = data?.totalElements || this.employees.length;
        this.applyFilters();
      },
      error: (err: any) => {
        console.error('[Employees] Failed to load:', err);
        if (err.status === 403) {
          this.errorMessage = 'You do not have permission to manage employees.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to load employees.';
        }
        this.employees = [];
        this.filteredEmployees = [];
        this.totalPages = 0;
        this.totalElements = 0;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.employees];

    // Filter by active status (client-side chip filter)
    if (this.activeFilter === 'active') {
      list = list.filter(e => e.active !== false);
    } else if (this.activeFilter === 'inactive') {
      list = list.filter(e => e.active === false);
    }

    // Filter by salary range (client-side)
    if (this.salaryMin !== null && this.salaryMin > 0) {
      list = list.filter(e => (e.salary || 0) >= this.salaryMin!);
    }
    if (this.salaryMax !== null && this.salaryMax > 0) {
      list = list.filter(e => (e.salary || 0) <= this.salaryMax!);
    }

    this.filteredEmployees = list;
    this.cdr.detectChanges();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadEmployees();
  }

  toggleActive(employee: any): void {
    this.employeeService.toggleEmployeeActive(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: () => alert('Failed to toggle employee status')
    });
  }

  deleteEmployee(employee: any): void {
    if (!confirm(`Delete employee "${employee.name}"? This cannot be undone.`)) return;
    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: () => alert('Failed to delete employee')
    });
  }

  // ========== EDIT MODAL ==========

  editModalOpen = false;
  editEmployee: any = null;
  editForm: any = {
    name: '', passportNumber: '', phoneNumber: '', email: '',
    salary: 0, role: 'EMPLOYEE',
    daysOfWork: 0, hoursOfWork: 0,
    employeeSince: '', dateOfBirth: '',
    address: '', emergencyContact: '', emergencyPhone: '', notes: ''
  };
  isSavingEdit = false;
  editLoading = false;

  openEditModal(employee: any): void {
    this.editModalOpen = true;
    this.editLoading = true;
    this.isSavingEdit = false;
    this.cdr.detectChanges();

    // Helper: convert datetime to YYYY-MM-DD for <input type="date">
    const toDateInput = (val: string) => val ? val.substring(0, 10) : '';

    // Fetch full employee data
    this.employeeService.getEmployeeById(employee.id).subscribe({
      next: (data: any) => {
        const e = data?.data || data;
        this.editEmployee = e;
        this.editForm = {
          name: e.name || '',
          passportNumber: e.passportNumber || '',
          phoneNumber: e.phoneNumber || '',
          email: e.email || '',
          salary: e.salary || 0,
          role: e.role || 'EMPLOYEE',
          daysOfWork: e.daysOfWork || 0,
          hoursOfWork: e.hoursOfWork || 0,
          employeeSince: toDateInput(e.employeeSince),
          dateOfBirth: toDateInput(e.dateOfBirth),
          address: e.address || '',
          emergencyContact: e.emergencyContact || '',
          emergencyPhone: e.emergencyPhone || '',
          notes: e.notes || ''
        };
        this.editLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.editLoading = false;
        this.editModalOpen = false;
        alert('Failed to load employee data');
        this.cdr.detectChanges();
      }
    });
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editEmployee = null;
    this.editLoading = false;
    this.isSavingEdit = false;
  }

  saveEditEmployee(): void {
    if (!this.editEmployee) return;
    this.isSavingEdit = true;

    const request: any = {
      name: this.editForm.name,
      passportNumber: this.editForm.passportNumber,
      phoneNumber: this.editForm.phoneNumber,
      email: this.editForm.email,
      salary: Number(this.editForm.salary) || 0,
      role: this.editForm.role,
      daysOfWork: this.editForm.daysOfWork ? Number(this.editForm.daysOfWork) : 0,
      hoursOfWork: this.editForm.hoursOfWork ? Number(this.editForm.hoursOfWork) : 0,
      employeeSince: this.editForm.employeeSince || null,
      dateOfBirth: this.editForm.dateOfBirth || null,
      address: this.editForm.address,
      emergencyContact: this.editForm.emergencyContact,
      emergencyPhone: this.editForm.emergencyPhone,
      notes: this.editForm.notes
    };

    this.employeeService.updateEmployee(this.editEmployee.id, request).pipe(
      finalize(() => { this.isSavingEdit = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadEmployees();
      },
      error: () => alert('Failed to update employee')
    });
  }

  formatRole(role: string): string {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.salaryMin = null;
    this.salaryMax = null;
    this.activeFilter = '';
    this.currentPage = 0;
    this.loadEmployees();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.salaryMin || this.salaryMax || this.activeFilter);
  }
}
