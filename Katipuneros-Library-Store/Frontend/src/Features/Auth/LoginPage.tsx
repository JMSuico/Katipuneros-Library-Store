// [Layer: Features/Auth]
// LoginPage.tsx -- Dedicated User and Cashier Desk Login Page.
// Rejects Chief Admin accounts (strictly separated on port 5174).
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../Endpoints/authApi';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginUser({ usernameOrEmail: identifier.trim(), password });
      if (res.success && res.user) {
        if (res.user.role === 'Cashier') {
          navigate('/cashier/checkout');
        } else if (res.user.role === 'Customer') {
          navigate('/customer/home');
        } else {
          setErrorMessage('Admin access is restricted to the dedicated Admin terminal at http://127.0.0.1:5174/admin.');
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Network connection failure. Ensure the .NET 10 API backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary-container/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-soft-blue/60 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <div>
              <h1 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                Katipuneros Library
              </h1>
              <span className="font-caption text-caption text-text-secondary">
                User &amp; Circulation Desk Portal
              </span>
            </div>
          </Link>
          <span className="font-caption text-caption font-semibold px-3 py-1 rounded-full bg-surface-container text-primary">
            PORT 5173
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-headline-2 text-headline-2 text-text-primary font-bold">
            Sign In
          </h2>
          <p className="font-body text-body text-text-secondary mt-1">
            Access your borrowing account, active reserves, digital shelves, or cashier circulation terminal.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-small flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
              Institutional Email or Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                account_circle
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="user@katipuneros.edu.ph or username"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-caption text-caption text-primary hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
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
            className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>Sign In to Circulation</span>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-surface-container-high flex flex-col items-center gap-3">
          <p className="font-small text-small text-text-secondary">
            Don't have a user library card yet?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Register here
            </Link>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary font-small text-small font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Return to webpage to the landing page</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 bg-surface-container-lowest/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>
            <div>
              <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Credential Reset Protocol
              </h3>
              <p className="font-body text-small text-text-secondary mt-2 leading-relaxed">
                For academic patron and circulation safety, credentials cannot be reset via unverified links. Please present your Institutional ID card in person at <strong>Circulation Desk Counter Bay-B4</strong> or send an inquiry from your registered university email to <strong>desk@katipuneros.edu.ph</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-bold text-small shadow-sm transition-all cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
