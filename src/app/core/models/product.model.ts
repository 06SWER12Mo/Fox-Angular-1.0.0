import { Image } from './common.model';

export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  costPrice: number;
  compareAtPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  sku: string;
  barcode: string;
  stockQuantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  weight: number;
  length: number;
  width: number;
  height: number;
  active: boolean;
  featured: boolean;
  inStock: boolean;
  digital: boolean;
  averageRating: number;
  totalReviews: number;
  viewCount: number;
  soldCount: number;
  categoryId: number;
  categoryName: string;
  images: Image[];
  primaryImageUrl: string;
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  id: number;
  name: string;
  value: string;
  unit: string;
  displayOrder: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  discountedPrice: number;
  stockQuantity: number;
  inStock: boolean;
  weight: number;
  imageUrl: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  sku: string;
  barcode?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  active?: boolean;
  featured?: boolean;
  digital?: boolean;
  categoryId?: number;
  specifications?: ProductSpecificationRequest[];
  variants?: ProductVariantRequest[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface ProductSpecificationRequest {
  name: string;
  value: string;
  unit?: string;
  displayOrder?: number;
}

export interface ProductVariantRequest {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  weight?: number;
}

export interface ProductSearchRequest {
  keyword?: string;
  name?: string;
  categoryId?: number;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  inStock?: boolean;
  featured?: boolean;
  onSale?: boolean;
  minRating?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface ProductSummary {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  sku: string;
  compareAtPrice:number;
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