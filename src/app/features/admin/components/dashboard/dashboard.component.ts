import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../../core/services/api/analytics.service';
import { OrderService } from '../../../../core/services/api/order.service';
import { ProductService } from '../../../../core/services/api/product.service';
import { UserService } from '../../../../core/services/api/user.service';
import { CategoryService } from '../../../../core/services/api/category.service';
import { LocationService } from '../../../../core/services/api/location.service';
import { EmployeeService } from '../../../../core/services/api/employee.service';
import { OrderSummary } from '../../../../core/models/order.model';
import { DashboardResponse, TopProduct } from '../../../../core/models/analytics.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error = false;

  // Stats
  totalSales = 0;
  todaySales = 0;
  totalOrders = 0;
  pendingOrders = 0;
  totalProducts = 0;
  totalCategories = 0;
  totalCustomers = 0;
  lowStockCount = 0;
  deliveryTowns = 0;
  totalEmployees = 0;

  // Growth
  revenueGrowth = '';
  orderGrowth = '';

  // Chart
  salesByDay: number[] = [];
  days: string[] = [];

  // Recent orders
  recentOrders: OrderSummary[] = [];

  // Top selling products
  topSellingProducts: TopProduct[] = [];

  // Quick actions
  quickActions = [
    { path: '/admin/products/new', label: 'Add Product', icon: 'plus' },
    { path: '/admin/categories/new', label: 'Add Category', icon: 'plus' },
    { path: '/admin/receipts/new', label: 'New Receipt', icon: 'plus' },
    { path: '/admin/orders', label: 'View Orders', icon: 'eye' },
    { path: '/admin/settings', label: 'Store Settings', icon: 'eye' },
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private orderService: OrderService,
    private productService: ProductService,
    private locationService: LocationService,
    private employeeService: EmployeeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = false;

    let remaining = 5;
    const finalize = () => {
      if (--remaining <= 0) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    };

    // Use individual subscriptions so a single API failure doesn't break everything
    this.analyticsService.getDashboard().subscribe({
      next: (data) => { this.processDashboard(data); finalize(); },
      error: () => { console.warn('Dashboard analytics failed'); finalize(); }
    });

    this.orderService.getAllOrders(0, 10).subscribe({
      next: (res) => { this.processOrders(res); finalize(); },
      error: () => { console.warn('Dashboard recent orders failed'); finalize(); }
    });

    this.productService.getLowStockProducts().subscribe({
      next: (products) => {
        if (products?.length) this.lowStockCount = products.length;
        finalize();
      },
      error: () => { console.warn('Dashboard low stock failed'); finalize(); }
    });

    // Delivery towns: count towns across all areas where delivery is enabled
    this.locationService.getAllBigAreas().subscribe({
      next: (areas) => {
        const list: any[] = Array.isArray(areas) ? areas : (areas as any)?.content || [];
        this.deliveryTowns = list.reduce((count, area) => {
          const towns: any[] = Array.isArray(area?.towns) ? area.towns : [];
          return count + towns.filter((t: any) => t.deliveryAvailable !== false).length;
        }, 0);
        finalize();
      },
      error: () => { console.warn('Dashboard delivery towns failed'); finalize(); }
    });

    this.employeeService.getEmployeeStats().subscribe({
      next: (stats) => { this.totalEmployees = stats?.totalEmployees || 0; finalize(); },
      error: () => { console.warn('Dashboard employee count failed'); finalize(); }
    });
  }

  private processDashboard(d: DashboardResponse): void {
    this.totalSales = d.totalRevenue || 0;
    this.todaySales = d.todayRevenue || 0;
    this.totalOrders = d.totalOrders || 0;
    this.pendingOrders = d.pendingOrders || 0;
    this.totalProducts = d.totalProducts || 0;
    this.totalCategories = d.totalCategories || 0;
    this.totalCustomers = d.totalCustomers || 0;

    this.revenueGrowth = d.revenueGrowthPercentage != null
      ? `${d.revenueGrowthPercentage >= 0 ? '+' : ''}${d.revenueGrowthPercentage.toFixed(1)}%`
      : '';
    this.orderGrowth = d.orderGrowthPercentage != null
      ? `${d.orderGrowthPercentage >= 0 ? '+' : ''}${d.orderGrowthPercentage.toFixed(1)}%`
      : '';

    // Chart data from recentSales
    if (d.recentSales?.length) {
      this.salesByDay = d.recentSales.map(s => s.revenue || 0);
      this.days = d.recentSales.map(s => {
        const date = new Date(s.date);
        return date.toLocaleDateString('en', { weekday: 'short' });
      });
    }

    // Top selling products
    if (d.topSellingProducts?.length) {
      this.topSellingProducts = d.topSellingProducts.slice(0, 5);
    }
  }

  private processOrders(response: any): void {
    const content = response?.content || response || [];
    this.recentOrders = Array.isArray(content) ? content.slice(0, 5) : [];
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getMaxValue(): number {
    return Math.max(...this.salesByDay, 1);
  }

  viewOrder(id: number): void {
    this.router.navigate(['/admin/orders', id]);
  }
}
