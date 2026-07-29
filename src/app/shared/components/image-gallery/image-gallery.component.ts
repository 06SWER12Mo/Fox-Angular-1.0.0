import { Component, Input, OnInit } from '@angular/core';
import { Image } from '../../../core/models/common.model';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  standalone: false
})
export class ImageGalleryComponent implements OnInit {
  @Input() images: Image[] = [];
  @Input() defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%23cccccc"%3E📷%3C/text%3E%3C/svg%3E';
  
  selectedImage = 0;
  thumbnails: string[] = [];
  imageErrors: Set<number> = new Set();

  ngOnInit(): void {
    this.thumbnails = this.images.map((img, i) => this.resolveUrl(img.imageUrl, i));
  }

  /**
   * Resolve image URLs the same way as ProductCardComponent:
   * - Absolute http/https URLs are used as-is
   * - Relative /api/... paths get the backend base prepended
   * - Plain filenames get wrapped in /api/images/
   * - On error, fall back to the default placeholder
   */
  resolveUrl(url: string | undefined | null, index?: number): string {
    if (!url) return this.defaultImage;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `http://localhost:8081${url}`;
    return `http://localhost:8081/api/images/${url}`;
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  getSelectedImageUrl(): string {
    if (this.images.length > 0 && this.images[this.selectedImage]) {
      return this.resolveUrl(this.images[this.selectedImage].imageUrl, this.selectedImage);
    }
    return this.defaultImage;
  }

  getThumbnailClass(index: number): string {
    return index === this.selectedImage ? 'active' : '';
  }

  onImageError(index: number): void {
    this.imageErrors.add(index);
  }

  isThumbnailError(index: number): boolean {
    return this.imageErrors.has(index);
  }
}