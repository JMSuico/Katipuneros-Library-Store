// [Layer: Endpoints/Admin]
// userApi.ts -- API client for administrative patron and staff account management.
// Dispatches requests to /api/users on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface AdminUserRecord {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Customer';
  status: 'active' | 'suspended' | 'pending';
  libraryCardNumber?: string;
  department?: string;
  phoneNumber?: string;
  isActive: boolean;
  joinedDate: string;
}

interface RawBackendUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  libraryCardNumber: string;
  department: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export async function getAdminUsersList(role?: number): Promise<AdminUserRecord[]> {
  const url = role !== undefined ? `/users?role=${role}` : '/users';
  const res = await apiRequest<RawBackendUser[]>(url);

  if (res.success && Array.isArray(res.data)) {
    return res.data.map((u) => ({
      id: u.id,
      name: u.fullName,
      fullName: u.fullName,
      email: u.email,
      role: (u.role === 'Admin' || u.role === 'Cashier' ? u.role : 'Customer') as 'Admin' | 'Cashier' | 'Customer',
      status: u.isActive ? 'active' : 'suspended',
      libraryCardNumber: u.libraryCardNumber,
      department: u.department,
      phoneNumber: u.phoneNumber,
      isActive: u.isActive,
      joinedDate: u.createdAt.slice(0, 10),
    }));
  }

  return [];
}

export async function updateUserRole(userId: string, role: number) {
  return apiRequest<object>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  return apiRequest<object>(`/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });
}
