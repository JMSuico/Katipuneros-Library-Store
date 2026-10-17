// [Layer: Features/Auth]
// AdminLoginPage.tsx -- Administrator Access Portal.
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getStoredUser } from '../../Endpoints/authApi';
import { getAuthToken, isTokenValid, clearAuthSession } from '../../Endpoints/apiClient';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    if (token && isTokenValid(token) && user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (token && !isTokenValid(token)) {
      clearAuthSession();
    }
  }, [navigate]);

  // Credentials State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Submission & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please provide your username or email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginUser({ usernameOrEmail: identifier.trim(), password });
      if (res.success && res.user) {
        if (res.user.role !== 'Admin') {
          setErrorMessage(
            'Access Denied: The Admin Terminal is restricted to Chief Administrators only.'
          );
          return;
        }
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid administrator credentials.');
      }
    } catch {
      setErrorMessage('Communication error with API server. Please ensure the backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B131B] text-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#121E2A]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all">
        {/* Header - ADMIN ACCESS */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-action-green/20 border border-action-green/40 flex items-center justify-center text-action-green shadow-inner shrink-0">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
          </div>
          <h1 className="font-headline-3 text-headline-3 text-white font-bold tracking-tight">
            ADMIN ACCESS
          </h1>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-small flex items-start gap-2.5 animate-fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-red-400 mt-0.5">warning</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Direct Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          {/* Username or Email */}
          <div>
            <label className="block font-caption text-caption uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
              Username or Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                account_circle
              </span>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or admin@katipuneros.edu.ph"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#091118] border border-white/10 text-white placeholder-gray-600 text-small focus:outline-none focus:ring-2 focus:ring-action-green/50 focus:border-action-green/50 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="block font-caption text-caption uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-2xl bg-[#091118] border border-white/10 text-white placeholder-gray-600 text-small focus:outline-none focus:ring-2 focus:ring-action-green/50 focus:border-action-green/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Enter Admin Console</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
