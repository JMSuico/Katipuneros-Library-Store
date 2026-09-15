// [Layer: Endpoints/Customer]
// borrowApi.ts -- API client for customer active borrowings and renewal operations.
// Dispatches requests to /api/borrow on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface CustomerLoanRecord {
  id: string;
  patronId: string;
  bookId: string;
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    deweyCode: string;
    coverImage?: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: number;
  renewalCount: number;
  gatePassCode: string;
  conditionNotes?: string;
}

export interface CustomerBorrowRequest {
  bookId: string;
  durationDays?: number;
}

export interface CustomerBorrowResponse {
  success: boolean;
  message: string;
  borrowId?: string;
  dueDate?: string;
}

export async function getCustomerActiveLoans(): Promise<CustomerLoanRecord[]> {
  const res = await apiRequest<CustomerLoanRecord[]>('/borrow/my-loans');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function renewCustomerLoan(loanId: string): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest<CustomerLoanRecord>(`/borrow/${loanId}/renew`, {
    method: 'POST',
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Loan renewed successfully (+7 days).' : 'Renewal rejected.'),
  };
}

export async function requestCustomerBorrow(req: CustomerBorrowRequest): Promise<CustomerBorrowResponse> {
  const res = await apiRequest<CustomerLoanRecord[]>('/borrow/checkout', {
    method: 'POST',
    body: JSON.stringify({
      bookBarcodes: [req.bookId],
    }),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Borrow request recorded.' : 'Borrow failed.'),
  };
}
