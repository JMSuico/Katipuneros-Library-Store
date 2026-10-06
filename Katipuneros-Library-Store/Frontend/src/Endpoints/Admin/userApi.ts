// [Layer: Endpoints/Admin]
// userApi.ts -- API client for administrative user and staff account management.
// Dispatches requests to /api/users on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface AdminUserRecord {
  id: string;
  name: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Customer';
  status: 'active' | 'suspended' | 'pending';
  libraryCardNumber?: string;
  department?: string;
  phoneNumber?: string;
  currentAddress?: string;
  age?: string;
  isActive: boolean;
  isProtected?: boolean;
  joinedDate: string;
}

interface RawBackendUser {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  libraryCardNumber: string;
  department: string;
  phoneNumber?: string;
  currentAddress?: string;
  isActive: boolean;
  isProtected?: boolean;
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
        firstName: u.firstName,
        middleName: u.middleName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        role: (u.role === 'Admin' || u.role === 'Cashier' ? u.role : 'Customer') as 'Admin' | 'Cashier' | 'Customer',
        status: u.isActive ? 'active' : 'suspended',
        libraryCardNumber: u.libraryCardNumber,
        department: u.department,
        phoneNumber: u.phoneNumber,
        currentAddress: u.currentAddress,
        isActive: u.isActive,
        isProtected: u.isProtected ?? false,
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

export const createAdminUser = async (user: { 
  firstName: string; 
  middleName?: string; 
  lastName: string; 
  username?: string;
  email: string; 
  password?: string; 
  role: number; 
  department?: string; 
  libraryCardNumber?: string;
  phoneNumber?: string;
  currentAddress?: string;
  age?: string;
}) =>
  await apiRequest<object>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });

export const updateAdminUser = async (
  userId: string,
  user: {
    firstName: string; 
    middleName?: string; 
    lastName: string; 
    username?: string;
    department?: string;
    libraryCardNumber?: string;
    phoneNumber?: string;
    currentAddress?: string;
    age?: string;
    password?: string;
    role: number;
    isActive: boolean;
  }
) =>
  await apiRequest<object>(`/users/${userId}/admin-update`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });

export const deleteAdminUser = async (userId: string) =>
  await apiRequest<object>(`/users/${userId}`, {
    method: 'DELETE',
  });

export const bulkDeleteAdminUsers = async (userIds: string[]) =>
  await apiRequest<object>('/users/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });

export interface ExportFilterQuery {
  startDate?: string;
  endDate?: string;
  nameStartsWith?: string;
  nameEndsWith?: string;
  nameContains?: string;
  idStartsWith?: string;
  idEndsWith?: string;
  idContains?: string;
  sortDirection?: 'asc' | 'desc';
}

export const exportUsersCsv = async () =>
  await apiRequest<Blob>('/users/export', {
    method: 'GET',
  });

export const exportFilteredUsers = async (query: ExportFilterQuery = {}) => {
  const params = new URLSearchParams();
  if (query.startDate) params.append('startDate', query.startDate);
  if (query.endDate) params.append('endDate', query.endDate);
  if (query.nameStartsWith) params.append('nameStartsWith', query.nameStartsWith);
  if (query.nameEndsWith) params.append('nameEndsWith', query.nameEndsWith);
  if (query.nameContains) params.append('nameContains', query.nameContains);
  if (query.idStartsWith) params.append('idStartsWith', query.idStartsWith);
  if (query.idEndsWith) params.append('idEndsWith', query.idEndsWith);
  if (query.idContains) params.append('idContains', query.idContains);
  if (query.sortDirection) params.append('sortDirection', query.sortDirection);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`/api/users/export?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Export failed');
  return await response.blob();
};

