import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss'],
  standalone: false
})
export class ProductFiltersComponent {
  @Input() filterForm!: FormGroup;
  @Input() currentSort = '';
  @Input() sortOptions: { value: string; label: string }[] = [];
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Output() sortChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<number | null>();
  @Output() clearFilters = new EventEmitter<void>();

  onSortChange(sortValue: string): void {
    this.sortChange.emit(sortValue);
  }

  onCategorySelect(categoryId: number | null): void {
    this.categoryChange.emit(categoryId);
  }

  clearSelectedCategory(): void {
    this.categoryChange.emit(null);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  getSortValue(): string {
    return this.currentSort || 'createdAt_DESC';
  }

  // Visual indicator for the price range bar
  getPriceBarWidth(): number {
    const minVal = this.filterForm.get('minPrice')?.value;
    const maxVal = this.filterForm.get('maxPrice')?.value;
    // If both are empty, show 0% — no visual bar
    if (!minVal && !maxVal) return 0;
    const minPrice = parseFloat(minVal) || 0;
    const maxPrice = parseFloat(maxVal) || 1000;
    if (maxPrice <= 0) return 0;
    const barFill = Math.min(100, (maxPrice - minPrice) / maxPrice * 100);
    return Math.max(0, barFill);
  }

  // Helper method to check if any filter is applied
  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(
      formValue.keyword ||
      formValue.minPrice ||
      formValue.maxPrice ||
      formValue.inStock === true ||
      formValue.onSale === true
    );
  }

  // Helper method to get active filters count
  getActiveFiltersCount(): number {
    const formValue = this.filterForm.value;
    let count = 0;
    if (formValue.keyword) count++;
    if (formValue.minPrice) count++;
    if (formValue.maxPrice) count++;
    if (formValue.inStock === true) count++;
    if (formValue.onSale === true) count++;
    return count;
  }

  // Reset individual filter
  resetFilter(filterName: string): void {
    this.filterForm.patchValue({ [filterName]: null });
  }

  // Check if price filter is active
  hasPriceFilter(): boolean {
    const { minPrice, maxPrice } = this.filterForm.value;
    return !!(minPrice || maxPrice);
  }
}