import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.scss'],
  standalone: false
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
}
