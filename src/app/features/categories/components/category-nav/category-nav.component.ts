import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CategoryService } from '../../../../core/services/api/category.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-nav',
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.scss'],
  standalone: false
})
export class CategoryNavComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  activeCategoryId: number | null = null;
  expandedCategories: Set<number> = new Set();
  isMobileMenuOpen = false;

  @Output() categorySelected = new EventEmitter<number>();

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    // Track active category from route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveCategoryFromRoute();
    });

    this.updateActiveCategoryFromRoute();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getActiveRootCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load categories';
        console.error('Error loading categories:', error);
      }
    });
  }

  updateActiveCategoryFromRoute(): void {
    const url = this.router.url;
    const match = url.match(/\/products\/category\/(\d+)/);
    if (match) {
      this.activeCategoryId = parseInt(match[1], 10);
    } else {
      this.activeCategoryId = null;
    }
  }

  selectCategory(categoryId: number): void {
    this.activeCategoryId = categoryId;
    this.categorySelected.emit(categoryId);
    this.router.navigate(['/products', 'category', categoryId]);
    this.closeMobileMenu();
  }

  clearCategory(): void {
    this.activeCategoryId = null;
    this.categorySelected.emit(0);
    this.router.navigate(['/products']);
    this.closeMobileMenu();
  }

  toggleCategory(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  isActive(categoryId: number): boolean {
    return this.activeCategoryId === categoryId;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  hasSubCategories(category: Category): boolean {
    return category.subCategories && category.subCategories.length > 0;
  }

  getCategoryCount(category: Category): number {
    return category.subCategoryCount || 0;
  }
}