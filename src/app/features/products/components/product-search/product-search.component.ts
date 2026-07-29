import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
  standalone: false
})
export class ProductSearchComponent implements OnInit {
  searchForm!: FormGroup;
  isFocused = false;
  @Output() search = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: ['']
    });

    this.searchForm.get('keyword')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search.emit(value);
        this.updateUrl(value);
      });
  }

  onSubmit(): void {
    const keyword = this.searchForm.get('keyword')?.value;
    this.search.emit(keyword);
    this.updateUrl(keyword);
  }

  updateUrl(keyword: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: keyword || null },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchForm.patchValue({ keyword: '' });
  }
}