import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../../../core/services/api/review.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-review-form',  
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
  standalone: false
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: number;
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  hasUserReviewed = false;
  isAuthenticated = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.tokenService.isAuthenticated();
    this.initForm();
    this.checkUserReview();
  }

  initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(2000)]]
    });
  }

  checkUserReview(): void {
    if (!this.isAuthenticated) return;

    this.reviewService.hasUserReviewedProduct(this.productId).subscribe({
      next: (hasReviewed) => {
        this.hasUserReviewed = hasReviewed;
      },
      error: (error) => {
        console.error('Error checking review:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid || !this.isAuthenticated) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { rating, comment } = this.reviewForm.value;

    this.reviewService.createReview(this.productId, { rating, comment }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Review submitted successfully! It will appear after approval.';
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.hasUserReviewed = true;
        this.reviewSubmitted.emit();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Failed to submit review';
        console.error('Error submitting review:', error);
      }
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }
}