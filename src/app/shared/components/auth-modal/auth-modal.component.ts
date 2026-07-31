import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/api/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { Subscription } from 'rxjs';

export type AuthModalMode = 'login' | 'register';

export interface AuthModalResult {
  success: boolean;
  mode: AuthModalMode;
}

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: false
})
export class AuthModalComponent implements OnInit, OnDestroy {
  mode: AuthModalMode = 'login';
  isLoading = false;
  submitted = false;
  errorMessage = '';
  loginFailed = false;

  // Login form fields
  loginForm!: FormGroup;
  hideLoginPassword = true;

  // Register form fields
  registerForm!: FormGroup;
  hideRegisterPassword = true;
  hideConfirmPassword = true;

  private subscriptions: Subscription[] = [];

  get lf() { return this.loginForm.controls; }
  get rf() { return this.registerForm.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<AuthModalComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { mode?: AuthModalMode }
  ) {
    this.mode = data?.mode || 'login';
  }

  ngOnInit(): void {
    this.initLoginForm();
    this.initRegisterForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private initRegisterForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.maxLength(20)]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup): null | { mismatch: true } {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  /** Map backend errors to a clean, friendly message shown inline in the form. */
  private getFriendlyError(error: any, kind: 'login' | 'register'): string {
    if (error?.status === 401 && kind === 'login') {
      return 'Invalid username or password.';
    }
    if (error?.status === 0) {
      return 'Cannot reach the server. Please check your connection and try again.';
    }
    if (kind === 'login') {
      return error?.error?.message || 'Login failed. Please try again.';
    }
    return error?.error?.message || 'Registration failed. Please try again.';
  }

  switchMode(mode: AuthModalMode): void {
    this.mode = mode;
    this.errorMessage = '';
    this.loginFailed = false;
    this.submitted = false;
  }

  onLoginSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.loginFailed = false;

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { usernameOrEmail, password } = this.loginForm.value;

    const sub = this.authService.login({ usernameOrEmail, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.dialogRef.close({ success: true, mode: 'login' } as AuthModalResult);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getFriendlyError(error, 'login');
        // Highlight the username/password fields on authentication failure
        this.loginFailed = error?.status === 401;
        this.cdr.detectChanges();
        console.error('Login error:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  onRegisterSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { username, email, password, firstName, lastName, phoneNumber } = this.registerForm.value;

    const sub = this.authService.register({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.dialogRef.close({ success: true, mode: 'register' } as AuthModalResult);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getFriendlyError(error, 'register');
        this.cdr.detectChanges();
        console.error('Registration error:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  close(): void {
    this.dialogRef.close({ success: false, mode: this.mode } as AuthModalResult);
  }
}
