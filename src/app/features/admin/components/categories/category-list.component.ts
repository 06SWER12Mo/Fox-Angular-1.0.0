import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/api/category.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: false
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [];
  isLoading = true;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => this.categories = Array.isArray(res) ? res : res?.content || [],
      error: () => this.categories = []
    });
  }

  editCategory(id: number): void {
    this.router.navigate(['/admin/categories', id, 'edit']);
  }

  toggleStatus(cat: any): void {
    this.categoryService.toggleCategoryActive(cat.id).subscribe({ next: () => this.loadCategories() });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category and its subcategories?')) return;
    this.categoryService.deleteCategory(id).subscribe({ next: () => this.loadCategories() });
  }
}
