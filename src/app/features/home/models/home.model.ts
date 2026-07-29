import { Category } from '../../../core/models/category.model';

export interface HomePageData {
  categories: Category[];
  featuredProducts: ProductSummary[];
  newArrivals: ProductSummary[];
  bestSellers: ProductSummary[];
  stats: StoreStats;
}

export interface ProductSummary {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  sku: string;
  compareAtPrice: number;
  stockQuantity: number;
  inStock: boolean;
  active: boolean;
  featured: boolean;
  averageRating: number;
  totalReviews: number;
  categoryId: number;
  categoryName: string;
  primaryImageUrl: string;
  viewCount: number;
  soldCount: number;
}

export interface StoreStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  happyCustomers: number;
}
