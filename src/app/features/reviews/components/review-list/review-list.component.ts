import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../../../core/services/api/review.service';
import { ProductService } from '../../../../core/services/api/product.service';
import { Review } from '../../../../core/models/review.model';
import { ProductSummary } from '../../../../core/models/product.model';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
  standalone: false
})
export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];
  product: ProductSummary | null = null;
  isLoading = true;
  errorMessage = '';
  isMyReviews = false;
  productId: number | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private reviewService: ReviewService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  scrollToReviewForm(): void {
  const formElement = document.querySelector('.write-review-section');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      this.isMyReviews = url.some(segment => segment.path === 'my-reviews');
    });

    this.route.params.subscribe(params => {
      if (params['productId']) {
        this.productId = +params['productId'];
        this.loadProduct(this.productId);
        this.loadProductReviews(this.productId);
      } else if (this.isMyReviews) {
        this.loadMyReviews();
      }
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductSummary(id).subscribe({
      next: (response: any) => {
        this.product = response?.data || response;
      },
      error: (error) => {
        console.error('Error loading product:', error);
      }
    });
  }

  loadProductReviews(productId: number): void {
    this.isLoading = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: (response: any) => {
        this.reviews = response?.data || response || [];
        this.totalElements = this.reviews.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load reviews';
        console.error('Error loading reviews:', error);
      }
    });
  }

  loadMyReviews(): void {
    this.isLoading = true;
    this.reviewService.getMyReviews().subscribe({
      next: (response: any) => {
        this.reviews = response?.data || response || [];
        this.totalElements = this.reviews.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load your reviews';
        console.error('Error loading my reviews:', error);
      }
    });
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }

  getRatingDistribution(): { rating: number; count: number; percentage: number }[] {
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: this.reviews.filter(r => r.rating === rating).length,
      percentage: 0
    }));

    const total = this.reviews.length;
    if (total > 0) {
      distribution.forEach(d => {
        d.percentage = (d.count / total) * 100;
      });
    }

    return distribution;
  }

  getStarWidth(rating: number): string {
    return `${(rating / 5) * 100}%`;
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteMyReview(reviewId).subscribe({
        next: () => {
          if (this.productId) {
            this.loadProductReviews(this.productId);
          } else {
            this.loadMyReviews();
          }
        },
        error: (error) => {
          console.error('Error deleting review:', error);
        }
      });
    }
  }

  goBack(): void {
    if (this.productId) {
      this.router.navigate(['/products', this.productId]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // Pagination logic would go here if using server-side pagination
  }

  get paginatedReviews(): Review[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.reviews.slice(start, end);
  }

  Math = Math;
}