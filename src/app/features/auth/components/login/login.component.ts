import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/api/auth.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  submitted = false;
  returnUrl: string = '/auth/profile';
  hidePassword = true;
  errorMessage: string = '';
  loginFailed = false;

  get f() { return this.loginForm.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.tokenService.isAuthenticated()) {
      const role = this.tokenService.getUserRole();
      if (role === 'MANAGER' || role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/auth/profile';
      }
      return;
    }

    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/auth/profile';
  }

  /** Map backend errors to a clean, friendly message shown inline in the form. */
  private getFriendlyError(error: any): string {
    if (error?.status === 401) {
      return 'Invalid username or password.';
    }
    if (error?.status === 0) {
      return 'Cannot reach the server. Please check your connection and try again.';
    }
    return error?.error?.message || 'Login failed. Please try again.';
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.loginFailed = false;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { usernameOrEmail, password } = this.loginForm.value;

    this.authService.login({ usernameOrEmail, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        // Redirect MANAGER/ADMIN to admin dashboard, others to returnUrl
        const role = this.tokenService.getUserRole();
        if (role === 'MANAGER' || role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = this.returnUrl;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getFriendlyError(error);
        // Highlight the username/password fields on authentication failure
        this.loginFailed = error?.status === 401;
        console.error('Login error:', error);
      }
    });
  }
}