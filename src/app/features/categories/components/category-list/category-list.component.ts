import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryService } from '../../../../core/services/api/category.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: false
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.categoryService.getActiveRootCategories().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        console.error('Error loading categories:', error);
      }
    });
  }

  selectCategory(categoryId: number): void {
    this.router.navigate(['/products/category', categoryId]);
  }

  getImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder-category.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }
}
