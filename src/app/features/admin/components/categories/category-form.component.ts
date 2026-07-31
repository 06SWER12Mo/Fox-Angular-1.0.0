import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/api/category.service';
import { ImageService } from '../../../../core/services/api/image.service';

@Component({
  selector: 'app-admin-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['../products/product-form.component.scss'],
  standalone: false
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditing = false;
  categoryId: number | null = null;
  isSaving = false;
  isLoading = false;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      active: [true],
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.categoryService.getCategoryById(id).subscribe({
      next: (cat: any) => {
        this.categoryForm.patchValue({
          name: cat.name,
          description: cat.description,
          active: cat.active !== false,
        });
        if (cat.imageUrl) {
          this.imagePreview = cat.imageUrl.startsWith('http')
            ? cat.imageUrl
            : 'http://localhost:8081' + cat.imageUrl;
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
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.categoryForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    const data = this.categoryForm.value;

    const obs = this.isEditing
      ? this.categoryService.updateCategory(this.categoryId!, data)
      : this.categoryService.createCategory(data);

    obs.subscribe({
      next: (category: any) => {
        // Upload the selected image so it is actually saved with the category
        if (this.selectedImageFile && category?.id) {
          this.imageService.uploadCategoryImage(category.id, this.selectedImageFile).subscribe({
            next: () => this.router.navigate(['/admin/categories']),
            error: (err) => {
              console.error('Category image upload failed:', err);
              this.errorMessage = 'Category saved, but the image could not be uploaded.';
              this.isSaving = false;
            }
          });
        } else {
          this.router.navigate(['/admin/categories']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save category';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/categories']);
  }
}
