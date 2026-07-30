import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/api/analytics.service';
import { SalesReport } from '../../../../core/models/analytics.model';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  standalone: false
})
export class AnalyticsComponent implements OnInit {
  isLoading = true;
  error = false;
  activeFilter = 'month';

  // Revenue stats
  revenue = 0;
  todayRevenue = 0;
  weeklyRevenue = 0;
  monthlyRevenue = 0;
  yearlyRevenue = 0;
  avgOrderValue = 0;
  totalOrders = 0;

  // Chart data
  salesByMonth: number[] = Array(12).fill(0);
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Top selling products
  bestSellers: any[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  getMaxMonthRevenue(): number {
    return Math.max(...this.salesByMonth, 1);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(filter?: string): void {
    this.isLoading = true;
    this.error = false;

    const now = new Date();

    // Helper: format as YYYY-MM-DD
    const fmtDate = (d: Date): string =>
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');

    // Helper: format as YYYY-MM-DDTHH:mm:ss (LocalDateTime for dashboard)
    const fmtDateTime = (d: Date): string =>
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + 'T' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');

    const today = now;
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 0);

    let start: Date;
    let end: Date = todayEnd;

    switch (filter || this.activeFilter) {
      case 'today':
        start = new Date(today);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
      default:
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Dashboard filtered needs LocalDateTime (ISO date-time)
    const dtStart = fmtDateTime(start);
    const dtEnd = fmtDateTime(end);

    // Sales report needs LocalDate (YYYY-MM-DD only)
    const dStart = fmtDate(start);
    const dEnd = fmtDate(end);

    forkJoin({
      dashboard: this.analyticsService.getDashboardFiltered(dtStart, dtEnd),
      sales: this.analyticsService.getSalesReport(dStart, dEnd),
    }).subscribe({
      next: (data) => {
        this.processDashboard(data.dashboard);
        this.processDateRangeSales(data.sales);
        // Use dashboard's topSellingProducts — they ARE filtered by date range
        const tops = data.dashboard?.topSellingProducts || [];
        this.bestSellers = tops.map((p: any) => ({
          productName: p.productName,
          totalRevenue: p.revenue || p.totalRevenue || 0,
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Analytics load error:', err);
        this.isLoading = false;
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  private processDashboard(d: any): void {
    this.revenue = d.totalRevenue || 0;
    this.todayRevenue = d.todayRevenue || 0;
    this.weeklyRevenue = d.thisWeekRevenue || 0;
    this.monthlyRevenue = d.thisMonthRevenue || 0;
    this.yearlyRevenue = d.totalRevenue || 0;
    this.avgOrderValue = d.averageOrderValue || 0;
    this.totalOrders = d.totalOrders || 0;
  }

  private processDateRangeSales(sales: SalesReport): void {
    if (sales?.dailySummary?.length) {
      const monthMap: { [key: number]: number } = {};
      for (let i = 0; i < 12; i++) {
        monthMap[i] = 0;
      }
      for (const day of sales.dailySummary) {
        const date = new Date(day.date);
        const monthIndex = date.getMonth();
        monthMap[monthIndex] = (monthMap[monthIndex] || 0) + day.revenue;
      }
      this.salesByMonth = this.months.map((_, i) => monthMap[i] || 0);
    } else {
      this.salesByMonth = [this.revenue];
    }
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.loadData(filter);
  }

  getFilteredRevenue(): string {
    switch (this.activeFilter) {
      case 'today': return this.todayRevenue.toLocaleString();
      case 'week': return this.weeklyRevenue.toLocaleString();
      case 'month': return this.monthlyRevenue.toLocaleString();
      case 'year': return this.yearlyRevenue.toLocaleString();
      default: return this.revenue.toLocaleString();
    }
  }
}
