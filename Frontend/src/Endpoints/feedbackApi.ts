// [Layer: Endpoints]
// feedbackApi.ts -- API client for visitor feedback submissions and ratings.
// Dispatches requests to /api/feedback on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from './apiClient';

export interface FeedbackSubmission {
  rating: number; // 1 to 4 or 5
  comments: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export interface FeedbackRecord {
  id: string;
  rating: number;
  comments?: string;
  createdAt: string;
  patron?: {
    id: string;
    fullName: string;
  };
}

export async function submitFeedback(data: FeedbackSubmission): Promise<FeedbackResponse> {
  const res = await apiRequest<object>('/feedback', {
    method: 'POST',
    body: JSON.stringify({
      rating: Math.min(4, Math.max(1, data.rating)),
      comments: data.comments,
    }),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Thank you for your rating and feedback.' : 'Failed to submit feedback.'),
  };
}

export async function getPublicFeedbacks(): Promise<FeedbackRecord[]> {
  const res = await apiRequest<FeedbackRecord[]>('/feedback');
  return res.success && Array.isArray(res.data) ? res.data : [];
}
