export interface DashboardResponse {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalCategories: number;
  totalReviews: number;
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockQuantity: number;
  revenueGrowthPercentage: number;
  orderGrowthPercentage: number;
  customerGrowthPercentage: number;
  recentSales: SalesByDay[];
  topSellingProducts: TopProduct[];
  topCategories: TopCategory[];
  lastUpdated: string;
}

export interface SalesByDay {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  productSku: string;
  totalSold: number;
  revenue: number;
  imageUrl: string;
}

export interface TopCategory {
  categoryId: number;
  categoryName: string;
  productCount: number;
  revenue: number;
}

export interface SalesReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  totalTax: number;
  totalShipping: number;
  totalDiscount: number;
  totalRefunds: number;
  netRevenue: number;
  dailySummary: DailySalesSummary[];
  hourlySummary: HourlySalesSummary[];
}

export interface DailySalesSummary {
  date: string;
  revenue: number;
  orderCount: number;
  itemsSold: number;
}

export interface HourlySalesSummary {
  hour: number;
  revenue: number;
  orderCount: number;
}

export interface ProductAnalytics {
  productId: number;
  productName: string;
  productSku: string;
  price: number;
  stockQuantity: number;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  viewCount: number;
  conversionRate: number;
  wishlistCount: number;
  lastSoldDate: string;
  categoryName: string;
  categoryId: number;
  primaryImageUrl: string;
}

export interface CategoryAnalytics {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number;
  parentCategoryName: string;
  productCount: number;
  activeProductCount: number;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  subCategoryCount: number;
  revenuePercentage: number;
  categoryGrowth: number;
}

export interface GeographicReport {
  countries: CountryReport[];
  cities: CityReport[];
  regions: RegionReport[];
  totalRevenue: number;
  totalOrders: number;
}

export interface CountryReport {
  country: string;
  orderCount: number;
  revenue: number;
  customerCount: number;
  revenuePercentage: number;
}

export interface CityReport {
  city: string;
  country: string;
  orderCount: number;
  revenue: number;
  customerCount: number;
}

export interface RegionReport {
  region: string;
  country: string;
  orderCount: number;
  revenue: number;
}