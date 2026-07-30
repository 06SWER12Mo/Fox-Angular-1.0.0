import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['../products/product-list.component.scss'],
  standalone: false
})
export class SessionsComponent implements OnInit {
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    this.isLoading = false;
  }
}
