export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
  parentId: number;
  parentName: string;
  subCategories: Category[];
  subCategoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  active?: boolean;
  displayOrder?: number;
  parentId?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
  parentCategoryId: number;
  parentCategoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  displayOrder?: number;
  parentCategoryId: number;
}