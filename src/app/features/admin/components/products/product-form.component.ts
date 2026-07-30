import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/api/product.service';
import { CategoryService } from '../../../../core/services/api/category.service';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: false
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditing = false;
  productId: number | null = null;
  isSaving = false;
  isLoading = false;
  categories: any[] = [];
  imagePreview: string | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      stockQuantity: [0, Validators.min(0)],
      sku: [''],
      barcode: [''],
      brand: [''],
      categoryId: [null, Validators.required],
      featured: [false],
      active: [true],
    });

    this.loadCategories();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats: any) => this.categories = Array.isArray(cats) ? cats : cats?.content || [],
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.productService.getProductById(id).subscribe({
      next: (p: any) => {
        this.productForm.patchValue({
          name: p.name,
          description: p.description,
          price: p.price,
          discount: p.discountPercentage || 0,
          stockQuantity: p.stockQuantity || 0,
          sku: p.sku,
          barcode: p.barcode,
          categoryId: p.categoryId,
          featured: p.featured || false,
          active: p.active !== false,
        });
        if (p.primaryImageUrl) {
          this.imagePreview = p.primaryImageUrl.startsWith('http')
            ? p.primaryImageUrl
            : 'http://localhost:8081' + p.primaryImageUrl;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    const data = this.productForm.value;

    const obs = this.isEditing
      ? this.productService.updateProduct(this.productId!, data)
      : this.productService.createProduct(data);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save product';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
