import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'online-store';
  showBackToHome = false;
  isAdminRoute = false;
  private sub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize immediately from current URL to avoid flash
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.showBackToHome = this.router.url !== '/' && this.router.url !== '';

    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showBackToHome = e.url !== '/' && e.url !== '';
      this.isAdminRoute = e.url.startsWith('/admin');
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}