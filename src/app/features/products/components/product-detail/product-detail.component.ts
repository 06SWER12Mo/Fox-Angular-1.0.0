import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { CartService } from '../../../../core/services/api/cart.service';
import { ReviewService } from '../../../../core/services/api/review.service';
import { Product } from '../../../../core/models/product.model';
import { Review } from '../../../../core/models/review.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  isLoading = true;
  errorMessage = '';
  selectedQuantity = 1;
  selectedVariantId: number | null = null;
  isAddingToCart = false;
  activeTab: 'details' | 'specs' | 'reviews' = 'details';

  reviewForm!: FormGroup;
  isSubmittingReview = false;
  hasUserReviewed = false;
  userReview: Review | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initReviewForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProduct(+params['id']);
        this.loadReviews(+params['id']);
        this.checkUserReview(+params['id']);
      }
    });
  }

  initReviewForm(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(2000)]]
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response: any) => {
        this.product = response?.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load product';
        console.error('Error loading product:', error);
      }
    });
  }

  loadReviews(productId: number): void {
    this.reviewService.getProductReviews(productId).subscribe({
      next: (response: any) => {
        this.reviews = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  checkUserReview(productId: number): void {
    this.reviewService.getMyReviewForProduct(productId).subscribe({
      next: (response: any) => {
        this.hasUserReviewed = true;
        this.userReview = response?.data || response;
        if (this.userReview) {
          this.reviewForm.patchValue({
            rating: this.userReview.rating,
            comment: this.userReview.comment
          });
        }
      },
      error: () => {
        this.hasUserReviewed = false;
        this.userReview = null;
      }
    });
  }

  addToCart(): void {
    if (!this.product) return;

    this.isAddingToCart = true;
    const productId = this.selectedVariantId || this.product.id;
    const quantity = this.selectedQuantity;

    this.cartService.addToCart({ productId, quantity }).subscribe({
      next: () => {
        this.isAddingToCart = false;
        // Show success notification
        console.log('Product added to cart');
      },
      error: (error) => {
        this.isAddingToCart = false;
        console.error('Error adding to cart:', error);
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.product) return;

    this.isSubmittingReview = true;
    const { rating, comment } = this.reviewForm.value;

    this.reviewService.createReview(this.product.id, { rating, comment }).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.loadReviews(this.product!.id);
        this.checkUserReview(this.product!.id);
        // Show success notification
        console.log('Review submitted');
      },
      error: (error) => {
        this.isSubmittingReview = false;
        console.error('Error submitting review:', error);
      }
    });
  }

  deleteReview(): void {
    if (!this.userReview) return;

    if (confirm('Are you sure you want to delete your review?')) {
      this.reviewService.deleteMyReview(this.userReview.id).subscribe({
        next: () => {
          this.hasUserReviewed = false;
          this.userReview = null;
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.loadReviews(this.product!.id);
        },
        error: (error) => {
          console.error('Error deleting review:', error);
        }
      });
    }
  }

  selectVariant(variantId: number): void {
    this.selectedVariantId = variantId;
  }

  setQuantity(quantity: number): void {
    if (quantity >= 1) {
      this.selectedQuantity = quantity;
    }
  }

  incrementQuantity(): void {
    this.setQuantity(this.selectedQuantity + 1);
  }

  decrementQuantity(): void {
    this.setQuantity(this.selectedQuantity - 1);
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }

  getReviewCount(): number {
    return this.reviews.length;
  }

  getStockStatus(): { label: string; color: string } {
    if (!this.product) return { label: 'Out of Stock', color: 'warn' };
    if (this.product.stockQuantity === 0) {
      return { label: 'Out of Stock', color: 'warn' };
    } else if (this.product.stockQuantity <= 10) {
      return { label: `Only ${this.product.stockQuantity} left`, color: 'accent' };
    }
    return { label: 'In Stock', color: 'success' };
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getProductUrl(): string {
    return `/products/${this.product?.id}`;
  }

  Math = Math;
}