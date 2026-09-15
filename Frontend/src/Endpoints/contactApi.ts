// [Layer: Endpoints]
// contactApi.ts -- API client for public inquiries and contact form submissions.
// Dispatches sanitized requests to POST /api/contact on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from './apiClient';

export interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  referenceId?: string;
}

export interface ContactInquiryRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: number;
  submittedAt: string;
}

export async function submitContactMessage(data: ContactSubmission): Promise<ContactResponse> {
  const payload = {
    name: data.name,
    email: data.email,
    subject: data.subject || 'General Public Inquiry',
    message: data.message,
  };

  const res = await apiRequest<object>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Your inquiry has been submitted.' : 'Submission failed.'),
    referenceId: `KP-INQ-${Date.now().toString().slice(-6)}`,
  };
}

export async function getContactInquiries(status?: number): Promise<ContactInquiryRecord[]> {
  const url = status !== undefined ? `/contact/inquiries?status=${status}` : '/contact/inquiries';
  const res = await apiRequest<ContactInquiryRecord[]>(url);
  return res.success && Array.isArray(res.data) ? res.data : [];
}
