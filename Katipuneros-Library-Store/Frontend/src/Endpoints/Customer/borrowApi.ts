// [Layer: Endpoints/Customer]
// borrowApi.ts -- API client for customer active borrowings, renewals, and fine accounting.
// Dispatches requests to /api/borrow and /api/fines on .NET 10 Web API.
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
  status: 'Active' | 'Returned' | 'Overdue' | 'Lost' | 'Cancelled' | string;
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

export interface CustomerFineRecord {
  id: string;
  patronId: string;
  borrowTransactionId: string;
  amount: number;
  balanceRemaining: number;
  waivedAmount: number;
  status: string;
  reason: string;
  assessedAt: string;
  settledAt?: string;
  paymentMethod?: string;
}

export interface CustomerFinesResponse {
  balance: number;
  fines: CustomerFineRecord[];
  paidFines: number;
}

export const getCustomerActiveLoans = async (): Promise<CustomerLoanRecord[]> => {
  const res = await apiRequest<CustomerLoanRecord[]>('/borrow/my-loans');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getCustomerLoanHistory = async (): Promise<CustomerLoanRecord[]> => {
  const res = await apiRequest<CustomerLoanRecord[]>('/borrow/my-history');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const renewCustomerLoan = async (loanId: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiRequest<CustomerLoanRecord>(`/borrow/${loanId}/renew`, {
    method: 'POST',
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Loan renewed successfully (+7 days).' : 'Renewal rejected.'),
  };
};

export const requestCustomerBorrow = async (req: CustomerBorrowRequest): Promise<CustomerBorrowResponse> => {
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
};

export const exportCustomerLoans = async () =>
  await apiRequest<Blob>('/borrow/my-loans/export', {
    method: 'GET',
  });

export const getCustomerFines = async (): Promise<CustomerFinesResponse> => {
  const res = await apiRequest<{ balance?: number; fines?: CustomerFineRecord[]; paidFines?: number } | CustomerFineRecord[]>('/fines/my-fines');
  if (!res.success || !res.data) {
    return { balance: 0, fines: [], paidFines: 0 };
  }

  // Handle case where backend returns array of FineTransactions
  if (Array.isArray(res.data)) {
    const finesList: CustomerFineRecord[] = res.data;
    const balance = finesList.reduce((sum, f) => {
      const remaining = typeof f.balanceRemaining === 'number'
        ? f.balanceRemaining
        : (f.status === 'Settled' || f.status === 'Waived' ? 0 : f.amount || 0);
      return sum + remaining;
    }, 0);
    const paidFines = finesList.reduce((sum, f) => {
      const amount = f.amount || 0;
      const remaining = typeof f.balanceRemaining === 'number' ? f.balanceRemaining : 0;
      return sum + Math.max(0, amount - remaining);
    }, 0);
    return { balance, fines: finesList, paidFines };
  }

  // Handle case where backend returns object { balance, fines, paidFines }
  const data = res.data;
  const finesList: CustomerFineRecord[] = Array.isArray(data.fines) ? data.fines : [];
  const balance = typeof data.balance === 'number'
    ? data.balance
    : finesList.reduce((sum, f) => sum + (f.balanceRemaining ?? (f.status === 'Settled' || f.status === 'Waived' ? 0 : f.amount || 0)), 0);
  const paidFines = typeof data.paidFines === 'number'
    ? data.paidFines
    : finesList.reduce((sum, f) => sum + Math.max(0, (f.amount || 0) - (f.balanceRemaining || 0)), 0);

  return { balance, fines: finesList, paidFines };
};
