// [Layer: Endpoints/Admin]
// userApi.ts -- API client for administrative user and staff account management.
// Dispatches requests to /api/users on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest, getApiBaseUrl, getAuthToken } from '../apiClient';

export interface AdminUserRecord {
  id: string;
  name: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  surname?: string;
  username?: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Customer';
  status: 'active' | 'suspended' | 'pending';
  libraryCardNumber?: string;
  department?: string;
  phoneNumber?: string;
  phone?: string;
  currentAddress?: string;
  address?: string;
  permanentAddress?: string;
  employmentStatus?: string;
  profilePictureUrl?: string;
  avatarUrl?: string;
  age?: string;
  isActive: boolean;
  isProtected?: boolean;
  joinedDate: string;
  createdAt?: string;
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
  permanentAddress?: string;
  employmentStatus?: string;
  profilePictureUrl?: string;
  age?: string;
  isActive: boolean;
  isProtected?: boolean;
  createdAt: string;
}

export const getAdminUsersList = async (role?: number): Promise<AdminUserRecord[]> => {
  const url = role !== undefined ? `/users?role=${role}` : '/users';
  const res = await apiRequest<RawBackendUser[]>(url);

  if (!res.success) {
    throw new Error(res.message || 'Failed to retrieve user accounts from server.');
  }

  return Array.isArray(res.data)
    ? res.data.map((u) => {
        const rawName = (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User').trim();
        return {
          id: u.id || '',
          name: rawName,
          fullName: rawName,
          firstName: u.firstName || '',
          middleName: u.middleName || '',
          lastName: u.lastName || '',
          surname: u.lastName || '',
          username: u.username || '',
          email: u.email || '',
          role: (u.role === 'Admin' || u.role === 'Cashier' ? u.role : 'Customer') as 'Admin' | 'Cashier' | 'Customer',
          status: (u.isActive ? 'active' : 'suspended') as 'active' | 'suspended',
          libraryCardNumber: u.libraryCardNumber || `#KP-${u.id ? u.id.slice(0, 5) : 'USER'}`,
          department: u.department || 'General',
          phoneNumber: u.phoneNumber || '',
          phone: u.phoneNumber || '',
          currentAddress: u.currentAddress || '',
          address: u.currentAddress || '',
          permanentAddress: u.permanentAddress || '',
          employmentStatus: u.employmentStatus || '',
          profilePictureUrl: u.profilePictureUrl || '',
          avatarUrl: u.profilePictureUrl || '',
          age: u.age || '',
          isActive: u.isActive ?? true,
          isProtected: u.isProtected ?? false,
          joinedDate: u.createdAt ? u.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          createdAt: u.createdAt || new Date().toISOString(),
        };
      })
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
  permanentAddress?: string;
  employmentStatus?: string;
  profilePictureUrl?: string;
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
    email?: string;
    department?: string; 
    libraryCardNumber?: string;
    phoneNumber?: string;
    currentAddress?: string;
    permanentAddress?: string;
    employmentStatus?: string;
    profilePictureUrl?: string;
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

  const token = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}/users/export?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Export failed');
  return await response.blob();
};

