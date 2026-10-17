// [Layer: Endpoints]
// authApi.ts -- API client for user, cashier, and administrative authentication.
// Dispatches login and registration requests to /api/auth on .NET 10 Web API.
// Expresses all sync and async routines via clean lambda expressions.

import { apiRequest, setAuthToken, clearAuthSession, getAuthToken, getStoredUserKey, getUserInfoKey } from './apiClient';

export interface LoginRequest {
  email?: string;
  username?: string;
  usernameOrEmail?: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  email: string;
  username: string;
  password: string;
  employmentStatus: string;
  currentAddress: string;
  permanentAddress: string;
  libraryCardNumber?: string;
  department?: string;
  phoneNumber?: string;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Customer';
  libraryCardNumber?: string;
  department?: string;
  employmentStatus?: string;
  currentAddress?: string;
  permanentAddress?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  age?: number;
  status?: string;
}

export interface AuthResponseData {
  success: boolean;
  token: string;
  role: string;
  userId: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  username?: string;
  email: string;
  libraryCardNumber?: string;
  department?: string;
  employmentStatus?: string;
  currentAddress?: string;
  permanentAddress?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  age?: number;
  status?: string;
}

export interface CreateCashierRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  department?: string;
  phoneNumber?: string;
  libraryCardNumber?: string;
}

export const isCurrentPortAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const portalEnv = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PORTAL ? String(import.meta.env.VITE_PORTAL).toLowerCase() : '');
  return (
    portalEnv === 'admin' ||
    port === '5174' ||
    host.startsWith('admin.') ||
    host.includes('-admin.') ||
    host.includes('admin') ||
    window.location.pathname.startsWith('/admin')
  );
};

export const isCurrentPortCashier = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const portalEnv = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PORTAL ? String(import.meta.env.VITE_PORTAL).toLowerCase() : '');
  return (
    portalEnv === 'cashier' ||
    port === '5175' ||
    host.startsWith('cashier.') ||
    host.includes('-cashier.') ||
    host.includes('cashier') ||
    window.location.pathname.startsWith('/cashier')
  );
};

export const getStoredUser = (): AuthUser | null => {
  try {
    const key = getStoredUserKey();
    const raw =
      localStorage.getItem(key) ||
      localStorage.getItem('katipuneros_user_data') ||
      localStorage.getItem(getUserInfoKey()) ||
      localStorage.getItem('katipuneros_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (token: string, user: AuthUser): void => {
  setAuthToken(token);
  try {
    const serialized = JSON.stringify(user);
    const key = getStoredUserKey();
    localStorage.setItem(key, serialized);
    localStorage.setItem('katipuneros_user_data', serialized);
    localStorage.setItem(getUserInfoKey(), serialized);
    localStorage.setItem('katipuneros_user', serialized);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('katipuneros-auth-changed', { detail: user }));
    }
  } catch {
    // Ignore storage quota
  }
};

export const updateStoredUser = (updates: Partial<AuthUser>): AuthUser | null => {
  const current = getStoredUser();
  if (!current) return null;
  const merged: AuthUser = { ...current, ...updates };
  try {
    const serialized = JSON.stringify(merged);
    const key = getStoredUserKey();
    localStorage.setItem(key, serialized);
    localStorage.setItem('katipuneros_user_data', serialized);
    localStorage.setItem(getUserInfoKey(), serialized);
    localStorage.setItem('katipuneros_user', serialized);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('katipuneros-auth-changed', { detail: merged }));
    }
  } catch {
    // Ignore storage quota
  }
  return merged;
};

export const logoutUser = (): void => {
  clearAuthSession();
  try {
    const key = getStoredUserKey();
    localStorage.removeItem(key);
    localStorage.removeItem('katipuneros_user_data');
    localStorage.removeItem(getUserInfoKey());
    localStorage.removeItem('katipuneros_user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('katipuneros-auth-changed', { detail: null }));
    }
  } catch {
    // Ignore storage quota
  }
};

export const loginUser = async (
  req: LoginRequest
): Promise<{ success: boolean; message: string; user?: AuthUser; token?: string }> => {
  const res = await apiRequest<AuthResponseData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  if (res.success && res.data?.token) {
    const userRole = (
      res.data.role?.toLowerCase() === 'admin'
        ? 'Admin'
        : res.data.role?.toLowerCase() === 'cashier'
          ? 'Cashier'
          : 'Customer'
    ) as 'Admin' | 'Cashier' | 'Customer';

    // Check Admin separation: Public customer portal login cannot authenticate Admin accounts
    if (userRole === 'Admin' && !isCurrentPortAdmin()) {
      clearAuthSession();
      return {
        success: false,
        message:
          'Admin access is restricted to the Administrator Console (http://127.0.0.1:5174/admin/login or https://katipuneros-admin.onrender.com). Public customer portal login is not permitted.',
      };
    }

    // Check Admin separation: Administrator portal is restricted to Administrators only
    if (isCurrentPortAdmin() && userRole !== 'Admin') {
      clearAuthSession();
      return {
        success: false,
        message: `Access Denied: The Administrator Console is restricted to Chief Administrators only. Account [${res.data.email}] has role '${res.data.role}'.`,
      };
    }

    // Check Cashier separation: Cashier terminal is restricted to Cashiers only
    if (isCurrentPortCashier() && userRole !== 'Cashier' && userRole !== 'Admin') {
      clearAuthSession();
      return {
        success: false,
        message: `Access Denied: The Circulation Desk Terminal is restricted to Cashier desk staff only. Account [${res.data.email}] has role '${res.data.role}'.`,
      };
    }

    // Check Customer separation: If user is on customer portal, disallow Cashier login
    const isCustomerPortal = typeof window !== 'undefined' && (window.location.port === '5173' || (!isCurrentPortAdmin() && !isCurrentPortCashier()));
    if (isCustomerPortal && userRole === 'Cashier') {
      clearAuthSession();
      return {
        success: false,
        message: 'Cashier circulation desk staff must sign in at the dedicated Circulation Terminal (http://127.0.0.1:5175/cashier/login).',
      };
    }

    const user: AuthUser = {
      userId: res.data.userId,
      fullName: res.data.fullName,
      firstName: res.data.firstName,
      middleName: res.data.middleName,
      lastName: res.data.lastName,
      username: res.data.username,
      email: res.data.email,
      role: userRole,
      libraryCardNumber: res.data.libraryCardNumber,
      department: res.data.department,
      employmentStatus: res.data.employmentStatus,
      currentAddress: res.data.currentAddress,
      permanentAddress: res.data.permanentAddress,
      profilePictureUrl: res.data.profilePictureUrl,
      phoneNumber: res.data.phoneNumber,
      age: res.data.age,
      status: res.data.status,
    };

    saveAuthSession(res.data.token, user);
    return { success: true, message: res.message || 'Login successful.', user, token: res.data.token };
  }

  const errorMessage =
    res.message && !res.message.toLowerCase().includes('failed to fetch') && res.message !== 'Server error'
      ? res.message
      : (res.errors?.[0] && !res.errors[0].toLowerCase().includes('failed to fetch')
          ? res.errors[0]
          : (res.message || 'Invalid credentials. Please verify your email or username and password.'));

  return {
    success: false,
    message: errorMessage,
  };
};

export const registerUser = async (
  req: RegisterRequest
): Promise<{ success: boolean; message: string; user?: AuthUser; token?: string }> => {
  const res = await apiRequest<AuthResponseData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  if (res.success && res.data?.token) {
    const user: AuthUser = {
      userId: res.data.userId,
      fullName: res.data.fullName,
      firstName: res.data.firstName,
      middleName: res.data.middleName,
      lastName: res.data.lastName,
      username: res.data.username,
      email: res.data.email,
      role: 'Customer',
      libraryCardNumber: res.data.libraryCardNumber,
      department: res.data.department,
      employmentStatus: res.data.employmentStatus,
      currentAddress: res.data.currentAddress,
      permanentAddress: res.data.permanentAddress,
      profilePictureUrl: res.data.profilePictureUrl,
      phoneNumber: res.data.phoneNumber || req.phoneNumber,
      age: res.data.age,
      status: res.data.status || 'Approved',
    };
    saveAuthSession(res.data.token, user);
    return { success: true, message: res.message || 'User registered successfully.', user, token: res.data.token };
  }

  const errorMessage =
    res.message && !res.message.toLowerCase().includes('failed to fetch') && res.message !== 'Server error'
      ? res.message
      : (res.errors?.[0] && !res.errors[0].toLowerCase().includes('failed to fetch')
          ? res.errors[0]
          : (res.message || 'Registration failed. Please verify your details.'));

  return {
    success: false,
    message: errorMessage,
  };
};

export interface UpdateProfilePayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  username?: string;
  email?: string;
  employmentStatus?: string;
  currentAddress?: string;
  permanentAddress?: string;
  phoneNumber?: string;
  department?: string;
  age?: number;
}

export const updateUserProfile = async (
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string }> => {
  const res = await apiRequest<object>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (res.success) {
    updateStoredUser({
      fullName: payload.fullName,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      department: payload.department,
      employmentStatus: payload.employmentStatus,
      currentAddress: payload.currentAddress,
      permanentAddress: payload.permanentAddress,
      age: payload.age,
    });
    return {
      success: true,
      message: res.message || 'Profile updated successfully.',
    };
  }

  return {
    success: false,
    message: res.errors?.[0] || res.message || 'Failed to update profile.',
  };
};

export const uploadProfilePicture = async (
  pictureData: string
): Promise<{ success: boolean; message: string; profilePictureUrl?: string }> => {
  const res = await apiRequest<{ profilePictureUrl?: string; ProfilePictureUrl?: string }>('/auth/profile-picture', {
    method: 'POST',
    body: JSON.stringify({ pictureData }),
  });

  const url = res.data?.profilePictureUrl || res.data?.ProfilePictureUrl;
  if (res.success && url) {
    updateStoredUser({ profilePictureUrl: url });
    return {
      success: true,
      message: res.message || 'Profile picture updated successfully.',
      profilePictureUrl: url,
    };
  }

  return {
    success: false,
    message: res.errors?.[0] || res.message || 'Failed to upload profile picture.',
  };
};

let lastProfileFetchTime = 0;
let inflightProfilePromise: Promise<AuthUser | null> | null = null;

export const fetchCurrentProfile = async (force = false): Promise<AuthUser | null> => {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  if (!token) return null;

  const now = Date.now();
  if (!force && (now - lastProfileFetchTime < 5000)) {
    return getStoredUser();
  }

  if (inflightProfilePromise) {
    return inflightProfilePromise;
  }

  inflightProfilePromise = (async () => {
    try {
      const res = await apiRequest<AuthUser>('/auth/me');
      lastProfileFetchTime = Date.now();
      if (res.success && res.data) {
        updateStoredUser(res.data);
        return res.data;
      }
      return getStoredUser();
    } catch {
      return getStoredUser();
    } finally {
      inflightProfilePromise = null;
    }
  })();

  return inflightProfilePromise;
};


export const createCashierByAdmin = async (
  req: CreateCashierRequest
): Promise<{ success: boolean; message: string }> => {
  const res = await apiRequest<object>('/users/cashier', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Cashier account created successfully.' : 'Failed to create cashier.'),
  };
};

export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> => {
  const res = await apiRequest<object>('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  return {
    success: res.success,
    message: res.message || (res.success ? 'Password rotated successfully.' : 'Failed to rotate password.'),
  };
};

