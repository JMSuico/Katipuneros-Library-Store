// [Layer: Features/Auth]
// CashierLoginPage.tsx -- Dedicated Circulation Desk Cashier Login Page.
// Cashier authentication only -- NO public registration interface.
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../Endpoints/authApi';

export const CashierLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your cashier credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginUser({ usernameOrEmail: identifier.trim(), password });
      if (res.success && res.user) {
        if (res.user.role === 'Cashier') {
          navigate('/cashier/checkout');
        } else {
          setErrorMessage(
            `Access Denied: Account [${res.user.email}] holds role '${res.user.role}'. This terminal is restricted to Cashier desk staff only.`
          );
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Network connection failure. Ensure the circulation desk API is online.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0E2840] relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-action-green/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-[#123B5D]/90 backdrop-blur-2xl border border-white/20 shadow-2xl">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-action-green/20 border border-action-green/40 flex items-center justify-center text-action-green group-hover:scale-105 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-2xl">point_of_sale</span>
            </div>
            <div>
              <h1 className="font-headline-4 text-headline-4 text-white font-bold">
                Katipuneros Library
              </h1>
              <span className="font-caption text-caption text-[#D9EEF5]/80">
                Circulation Desk &amp; Terminal Auth
              </span>
            </div>
          </Link>
          <span className="font-caption text-caption font-bold px-3 py-1 rounded-full bg-action-green/20 text-action-green border border-action-green/30">
            CASHIER ONLY
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-headline-2 text-headline-2 text-white font-bold">
            Cashier Desk Login
          </h2>
          <p className="font-body text-small text-[#D9EEF5]/70 mt-1">
            Official circulation desk terminal. Cashier accounts are issued exclusively by Chief Administrators.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-status-danger/20 border border-status-danger/40 text-red-200 text-small flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-red-400 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-caption text-caption uppercase tracking-wider text-[#D9EEF5]/80 mb-1.5 font-semibold">
              Cashier Email or Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#D9EEF5]/60 text-[20px]">
                badge
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="cashier@katipuneros.edu.ph or username"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-small focus:outline-none focus:ring-2 focus:ring-action-green/60 focus:bg-white/15 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block font-caption text-caption uppercase tracking-wider text-[#D9EEF5]/80 mb-1.5 font-semibold">
              Desk Key / Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#D9EEF5]/60 text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-small focus:outline-none focus:ring-2 focus:ring-action-green/60 focus:bg-white/15 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D9EEF5]/60 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Authorizing Desk Terminal...</span>
              </>
            ) : (
              <span>Open Cashier Terminal</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="font-caption text-[11px] text-[#D9EEF5]/60">
            Circulation Station Bay 01
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#D9EEF5]/70 hover:text-action-green font-small text-small transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CashierLoginPage;
