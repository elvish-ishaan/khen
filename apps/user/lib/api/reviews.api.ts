import { apiClient } from './client';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  restaurantId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
  };
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  /**
   * Submit a review for a delivered order
   * @param data - Review data (orderId, rating, optional comment)
   */
  createReview: (data: CreateReviewRequest) => {
    return apiClient.post<{ review: Review }>('/reviews', data);
  },

  /**
   * Get all reviews for a specific restaurant
   * @param restaurantId - Restaurant ID
   */
  getRestaurantReviews: (restaurantId: string) => {
    return apiClient.get<{ reviews: Review[] }>(
      `/reviews/restaurant/${restaurantId}`
    );
  },
};
