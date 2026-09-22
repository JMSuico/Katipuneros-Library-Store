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

export const getAdminUsersList = async (role?: number): Promise<AdminUserRecord[]> => {
  const url = role !== undefined ? `/users?role=${role}` : '/users';
  const res = await apiRequest<RawBackendUser[]>(url);

  return res.success && Array.isArray(res.data)
    ? res.data.map((u) => ({
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
      }))
    : [];
};

export const updateUserRole = async (userId: string, role: number) =>
  await apiRequest<object>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });

export const toggleUserStatus = async (userId: string, isActive: boolean) =>
  await apiRequest<object>(`/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });

export const createAdminUser = async (user: { fullName: string; email: string; password?: string; role: number; department?: string; libraryCardNumber?: string }) =>
  await apiRequest<object>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });

export const deleteAdminUser = async (userId: string) =>
  await apiRequest<object>(`/users/${userId}`, {
    method: 'DELETE',
  });

export const exportUsersCsv = async () =>
  await apiRequest<Blob>('/users/export', {
    method: 'GET',
  });
