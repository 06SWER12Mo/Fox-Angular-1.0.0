export interface Review {
  id: number;
  rating: number;
  comment: string;
  approved: boolean;
  reviewerName: string;
  userId: number;
  productId: number;
  productName: string;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string;
  imageUrls?: string[];
}