import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  standalone: false
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get stars(): number[] {
    return Array(this.maxRating).fill(0);
  }

  getStarClass(index: number): string {
    const starIndex = index + 1;
    if (this.rating >= starIndex) {
      return 'filled';
    } else if (this.rating >= starIndex - 0.5) {
      return 'half';
    }
    return 'empty';
  }

  getStarWidth(index: number): number {
    const starIndex = index + 1;
    if (this.rating >= starIndex) {
      return 100;
    } else if (this.rating >= starIndex - 0.5) {
      return ((this.rating - (starIndex - 1)) / 0.5) * 100;
    }
    return 0;
  }
}