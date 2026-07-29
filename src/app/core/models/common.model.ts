export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
  statusCode: number;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  offset: number;
}

export interface Image {
  id: number;
  imageUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  entityType: string;
  entityId: number;
  imageType: string;
  displayOrder: number;
  altText: string;
  primary: boolean;
  createdAt: string;
}

export interface ImageUploadRequest {
  entityType: string;
  entityId: number;
  file: File;
  imageType?: string;
  displayOrder?: number;
  altText?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: { [key: string]: string };
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}