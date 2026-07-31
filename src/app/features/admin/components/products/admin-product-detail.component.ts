import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';

@Component({
  selector: 'app-admin-product-detail',
  templateUrl: './admin-product-detail.component.html',
  styleUrls: ['../orders/admin-order-detail.component.scss', './admin-product-detail.component.scss'],
  standalone: false
})
export class AdminProductDetailComponent implements OnInit {
  product: any = null;
  productId: number | null = null;
  isLoading = true;
  errorMessage = '';
  activeImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response: any) => {
        this.product = response?.data || response;
        // Prefer the images array so the active thumbnail always highlights correctly
        if (this.product?.images?.length) {
          this.activeImage = this.resolveImageUrl(this.product.images[0].imageUrl);
        } else if (this.product?.primaryImageUrl) {
          this.activeImage = this.resolveImageUrl(this.product.primaryImageUrl);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load product';
        this.cdr.detectChanges();
      }
    });
  }

  resolveImageUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : 'http://localhost:8081' + url;
  }

  get galleryImages(): any[] {
    if (!this.product) return [];
    const images = Array.isArray(this.product.images) ? this.product.images : [];
    return images.map((img: any) => ({ ...img, url: this.resolveImageUrl(img.imageUrl) }));
  }

  setActiveImage(url: string): void {
    this.activeImage = url;
  }

  getStockStatus(): { label: string; cls: string } {
    if (!this.product) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (this.product.stockQuantity === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (this.product.stockQuantity <= (this.product.lowStockThreshold || 10)) {
      return { label: `Low Stock (${this.product.stockQuantity})`, cls: 'badge-warning' };
    }
    return { label: 'In Stock', cls: 'badge-success' };
  }

  getDiscountPercentage(): number {
    if (!this.product) return 0;
    return this.product.discountPercentage || 0;
  }

  getAverageRating(): string {
    const rating = Number(this.product?.averageRating || 0);
    return rating > 0 ? rating.toFixed(1) + ' / 5' : '—';
  }

  edit(): void {
    if (this.productId) this.router.navigate(['/admin/products', this.productId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}
