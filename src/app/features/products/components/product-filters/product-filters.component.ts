import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

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
  @Output() sortChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

   onSortChange(event: MatSelectChange): void {
    this.sortChange.emit(event.value);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  getSortValue(): string {
    return this.currentSort || 'createdAt_DESC';
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