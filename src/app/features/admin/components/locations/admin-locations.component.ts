import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../../../core/services/api/location.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-locations',
  templateUrl: './admin-locations.component.html',
  styleUrls: ['../products/product-list.component.scss', './admin-locations.component.scss'],
  standalone: false
})
export class AdminLocationsComponent implements OnInit {
  bigAreas: any[] = [];
  filteredAreas: any[] = [];
  isLoading = true;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Area Modal
  showAreaModal = false;
  isEditingArea = false;
  areaForm: any = { name: '', code: '', description: '', displayOrder: 0 };
  isSavingArea = false;

  // Town Modal
  showTownModal = false;
  isEditingTown = false;
  selectedAreaId: number | null = null;
  townForm: any = {
    name: '', code: '', zipCode: '', description: '',
    deliveryFee: 0, deliveryAvailable: true, displayOrder: 0
  };
  isSavingTown = false;

  // Delete confirmation
  confirmDelete: { type: 'area' | 'town'; id: number; name: string } | null = null;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.applyFilter();
    });
  }

  loadAreas(): void {
    this.isLoading = true;
    this.locationService.getAllBigAreas().pipe(
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (areas: any) => {
        this.bigAreas = Array.isArray(areas) ? areas : areas?.content || [];
        this.applyFilter();
      },
      error: () => {
        this.bigAreas = [];
        this.filteredAreas = [];
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAreas = [...this.bigAreas];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredAreas = this.bigAreas.filter((a: any) =>
        a.name?.toLowerCase().includes(q) ||
        a.towns?.some((t: any) => t.name?.toLowerCase().includes(q))
      );
    }
    this.cdr.detectChanges();
  }

  showTowns(areaId: number): void {
    this.router.navigate(['/admin/locations', areaId, 'towns']);
  }

  // ========== AREA MODAL ==========

  openAddArea(): void {
    this.isEditingArea = false;
    this.areaForm = { name: '', code: '', description: '', displayOrder: 0 };
    this.showAreaModal = true;
    this.cdr.detectChanges();
  }

  openEditArea(area: any): void {
    this.isEditingArea = true;
    this.areaForm = { ...area };
    this.showAreaModal = true;
    this.selectedAreaId = area.id;
    this.cdr.detectChanges();
  }

  closeAreaModal(): void {
    this.showAreaModal = false;
    this.selectedAreaId = null;
  }

  saveArea(): void {
    if (!this.areaForm.name) return;
    this.isSavingArea = true;
    const request = { ...this.areaForm };

    const obs = this.isEditingArea && this.selectedAreaId
      ? this.locationService.updateBigArea(this.selectedAreaId, request)
      : this.locationService.createBigArea(request);

    obs.pipe(finalize(() => { this.isSavingArea = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.closeAreaModal(); this.loadAreas(); },
        error: () => alert('Failed to save area')
      });
  }

  // ========== TOWN MODAL ==========

  openAddTown(areaId: number): void {
    this.isEditingTown = false;
    this.selectedAreaId = areaId;
    this.townForm = {
      name: '', code: '', zipCode: '', description: '',
      deliveryFee: 0, deliveryAvailable: true, displayOrder: 0
    };
    this.showTownModal = true;
    this.cdr.detectChanges();
  }

  openEditTown(town: any): void {
    this.isEditingTown = true;
    this.selectedAreaId = town.bigAreaId;
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
    this.selectedAreaId = town.bigAreaId;
    this.cdr.detectChanges();
  }

  closeTownModal(): void {
    this.showTownModal = false;
    this.selectedAreaId = null;
  }

  saveTown(): void {
    if (!this.townForm.name || !this.selectedAreaId) return;
    this.isSavingTown = true;
    const request = {
      ...this.townForm,
      bigAreaId: this.selectedAreaId
    };
    delete request.id;

    const obs = this.isEditingTown
      ? this.locationService.updateTown(this.townForm.id, request)
      : this.locationService.createTown(request);

    obs.pipe(finalize(() => { this.isSavingTown = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.closeTownModal(); this.loadAreas(); },
        error: () => alert('Failed to save town')
      });
  }

  // ========== TOGGLES ==========

  toggleAreaActive(id: number): void {
    this.locationService.toggleBigAreaActive(id).subscribe({ next: () => this.loadAreas() });
  }

  toggleTownDelivery(town: any): void {
    this.locationService.toggleTownDeliveryAvailability(town.id).subscribe({ next: () => this.loadAreas() });
  }

  toggleTownActive(town: any): void {
    this.locationService.toggleTownActive(town.id).subscribe({ next: () => this.loadAreas() });
  }

  // ========== DELETE ==========

  requestDelete(type: 'area' | 'town', id: number, name: string): void {
    this.confirmDelete = { type, id, name };
  }

  cancelDelete(): void {
    this.confirmDelete = null;
  }

  confirmDeleteAction(): void {
    if (!this.confirmDelete) return;
    const { type, id } = this.confirmDelete;
    const obs = type === 'area'
      ? this.locationService.deleteBigArea(id)
      : this.locationService.deleteTown(id);

    obs.subscribe({
      next: () => { this.confirmDelete = null; this.loadAreas(); },
      error: () => { this.confirmDelete = null; alert(`Failed to delete ${type}`); }
    });
  }
}
