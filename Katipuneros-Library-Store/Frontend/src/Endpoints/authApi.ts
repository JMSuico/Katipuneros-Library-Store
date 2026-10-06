// [Layer: Endpoints]
// authApi.ts -- API client for user, cashier, and administrative authentication.
// Dispatches login and registration requests to /api/auth on .NET 10 Web API.
// Expresses all sync and async routines via clean lambda expressions.

import { apiRequest, setAuthToken, clearAuthSession } from './apiClient';

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

const STORED_USER_KEY = 'katipuneros_user_data';

export const isCurrentPortAdmin = (): boolean =>
  typeof window !== 'undefined' && window.location.port === '5174';

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (token: string, user: AuthUser): void => {
  setAuthToken(token);
  try {
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
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
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(merged));
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
    localStorage.removeItem(STORED_USER_KEY);
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
    // Check Admin separation: Port 5173 cannot log in as Admin
    if (res.data.role === 'Admin' && !isCurrentPortAdmin()) {
      clearAuthSession();
      return {
        success: false,
        message:
          'Admin access is restricted to the dedicated Admin terminal at http://127.0.0.1:5174/admin. Public portal login is not permitted.',
      };
    }

    // Check Admin separation: Port 5174 can ONLY log in as Admin
    if (isCurrentPortAdmin() && res.data.role !== 'Admin') {
      clearAuthSession();
      return {
        success: false,
        message: `Access Denied: The Admin Terminal at Port 5174 is restricted to Chief Administrators only. Account [${res.data.email}] has role '${res.data.role}'.`,
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
      role: (res.data.role === 'Admin' || res.data.role === 'Cashier'
        ? res.data.role
        : 'Customer') as 'Admin' | 'Cashier' | 'Customer',
      libraryCardNumber: res.data.libraryCardNumber,
      department: res.data.department,
      employmentStatus: res.data.employmentStatus,
      currentAddress: res.data.currentAddress,
      permanentAddress: res.data.permanentAddress,
      profilePictureUrl: res.data.profilePictureUrl,
    };

    saveAuthSession(res.data.token, user);
    return { success: true, message: res.message || 'Login successful.', user, token: res.data.token };
  }

  return {
    success: false,
    message: res.errors?.[0] || res.message || 'Invalid email or password.',
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
    };
    saveAuthSession(res.data.token, user);
    return { success: true, message: res.message || 'User registered successfully.', user, token: res.data.token };
  }

  return {
    success: false,
    message: res.errors?.[0] || res.message || 'Registration failed. Please verify your details.',
  };
};

export interface UpdateProfilePayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  employmentStatus?: string;
  currentAddress?: string;
  permanentAddress?: string;
  phoneNumber?: string;
  department?: string;
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
      phoneNumber: payload.phoneNumber,
      department: payload.department,
      currentAddress: payload.currentAddress,
      permanentAddress: payload.permanentAddress,
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

export const fetchCurrentProfile = async (): Promise<AuthUser | null> => {
  const res = await apiRequest<AuthUser>('/auth/me');
  if (res.success && res.data) {
    updateStoredUser(res.data);
    return res.data;
  }
  return getStoredUser();
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

