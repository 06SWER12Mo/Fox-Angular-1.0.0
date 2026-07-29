import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/api/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  submitted = false;
  emailSent = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotForm.value;

    // TODO: Implement forgot password API call when backend is ready
    // For now, simulate success
    setTimeout(() => {
      this.isLoading = false;
      this.emailSent = true;
      this.successMessage = 'Password reset link sent to your email!';
      console.log('Password reset requested for:', email);
    }, 1500);

    // Uncomment when backend is ready:
    /*
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
        this.successMessage = 'Password reset link sent to your email!';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to send reset link. Please try again.';
        console.error('Error sending reset link:', error);
      }
    });
    */
  }

  resendEmail(): void {
    this.emailSent = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.submitted = false;
    this.forgotForm.reset();
  }
}