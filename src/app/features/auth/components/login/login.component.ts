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

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

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
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}