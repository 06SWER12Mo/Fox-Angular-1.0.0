import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../../../core/services/api/location.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-area-towns',
  templateUrl: './admin-area-towns.component.html',
  styleUrls: ['../products/product-list.component.scss', './admin-area-towns.component.scss'],
  standalone: false
})
export class AdminAreaTownsComponent implements OnInit {
  area: any = null;
  towns: any[] = [];
  filteredTowns: any[] = [];
  isLoading = true;
  areaId: number = 0;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Town Modal
  showTownModal = false;
  isEditingTown = false;
  townForm: any = {
    name: '', code: '', zipCode: '', description: '',
    deliveryFee: 0, deliveryAvailable: true, displayOrder: 0
  };
  isSavingTown = false;

  // Delete confirmation
  confirmDelete: { id: number; name: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.areaId = +this.route.snapshot.params['areaId'];
    this.loadArea();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.applyFilter());
  }

  loadArea(): void {
    this.isLoading = true;
    this.locationService.getBigAreaById(this.areaId).pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (area: any) => {
        this.area = area;
        this.towns = area?.towns || [];
        this.applyFilter();
      },
      error: () => this.router.navigate(['/admin/locations'])
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTowns = [...this.towns];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredTowns = this.towns.filter((t: any) =>
        t.name?.toLowerCase().includes(q) ||
        t.zipCode?.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/admin/locations']);
  }

  // ========== TOWN MODAL ==========

  openAddTown(): void {
    this.isEditingTown = false;
    this.townForm = {
      name: '', code: '', zipCode: '', description: '',
      deliveryFee: 0, deliveryAvailable: true, displayOrder: 0
    };
    this.showTownModal = true;
    this.cdr.detectChanges();
  }

  openEditTown(town: any): void {
    this.isEditingTown = true;
    this.townForm = {
      id: town.id,
      name: town.name || '',
      code: town.code || '',
      zipCode: town.zipCode || '',
      description: town.description || '',
      deliveryFee: town.deliveryFee || 0,
      deliveryAvailable: town.deliveryAvailable !== false,
      displayOrder: town.displayOrder || 0
    };
    this.showTownModal = true;
    this.cdr.detectChanges();
  }

  closeTownModal(): void {
    this.showTownModal = false;
  }

  saveTown(): void {
    if (!this.townForm.name) return;
    this.isSavingTown = true;
    const request = { ...this.townForm, bigAreaId: this.areaId };
    delete request.id;

    const obs = this.isEditingTown
      ? this.locationService.updateTown(this.townForm.id, request)
      : this.locationService.createTown(request);

    obs.pipe(finalize(() => { this.isSavingTown = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.closeTownModal(); this.loadArea(); },
        error: () => alert('Failed to save town')
      });
  }

  // ========== TOGGLES ==========

  toggleTownDelivery(town: any): void {
    this.locationService.toggleTownDeliveryAvailability(town.id).subscribe({ next: () => this.loadArea() });
  }

  toggleTownActive(town: any): void {
    this.locationService.toggleTownActive(town.id).subscribe({ next: () => this.loadArea() });
  }

  // ========== DELETE ==========

  requestDelete(id: number, name: string): void {
    this.confirmDelete = { id, name };
  }

  cancelDelete(): void {
    this.confirmDelete = null;
  }

  confirmDeleteAction(): void {
    if (!this.confirmDelete) return;
    this.locationService.deleteTown(this.confirmDelete.id).subscribe({
      next: () => { this.confirmDelete = null; this.loadArea(); },
      error: () => { this.confirmDelete = null; alert('Failed to delete town'); }
    });
  }
}
