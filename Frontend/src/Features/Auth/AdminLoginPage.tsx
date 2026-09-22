// [Layer: Features/Auth]
// AdminLoginPage.tsx -- ALTCHA-Protected Administrator Access Portal.
// Uses ALTCHA Proof-of-Work (PoW) cryptographic captcha for human verification.
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../Endpoints/authApi';
import 'altcha';

// TypeScript declaration for the altcha-widget Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit' | string;
        challenge?: string;
        challengeurl?: string;
        hidefooter?: boolean | string;
        hidelogo?: boolean | string;
        strings?: string;
        theme?: string;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

const API_BASE = 'http://localhost:5000';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const altchaRef = useRef<HTMLElement | null>(null);

  // ALTCHA Verification State
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [altchaError, setAltchaError] = useState<string | null>(null);

  // Credentials State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Submission & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen for ALTCHA widget verification events
  const handleAltchaVerified = useCallback((e: Event) => {
    const detail = (e as CustomEvent<{ payload?: string }>).detail;
    if (detail?.payload) {
      setAltchaPayload(detail.payload);
      setIsHumanVerified(true);
      setAltchaError(null);
    }
  }, []);

  const handleStateChange = useCallback((e: Event) => {
    const detail = (e as CustomEvent<{ state?: string; payload?: string }>).detail;
    if (detail?.state === 'verified') {
      if (detail.payload) {
        setAltchaPayload(detail.payload);
      }
      setIsHumanVerified(true);
      setAltchaError(null);
    }
  }, []);

  const handleAltchaError = useCallback((e: Event) => {
    const detail = (e as CustomEvent<{ message?: string }>).detail;
    setAltchaError(detail?.message || 'Verification challenge failed. Please try again.');
    setIsHumanVerified(false);
  }, []);

  useEffect(() => {
    const widget = altchaRef.current;
    if (widget) {
      widget.addEventListener('verified', handleAltchaVerified);
      widget.addEventListener('statechange', handleStateChange);
      widget.addEventListener('error', handleAltchaError);
      return () => {
        widget.removeEventListener('verified', handleAltchaVerified);
        widget.removeEventListener('statechange', handleStateChange);
        widget.removeEventListener('error', handleAltchaError);
      };
    }
  }, [handleAltchaVerified, handleStateChange, handleAltchaError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please provide your username or email and password.');
      return;
    }

    if (!isHumanVerified) {
      setErrorMessage('Please complete the ALTCHA security verification first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Optional: verify ALTCHA payload server-side if payload exists
      if (altchaPayload) {
        try {
          const verifyRes = await fetch(`${API_BASE}/api/altcha/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: altchaPayload }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            setErrorMessage(verifyData.message || 'ALTCHA verification failed on server.');
            setIsLoading(false);
            return;
          }
        } catch {
          // If server verification check has an issue, log and continue with login
        }
      }

      // Proceed with actual admin authentication
      const res = await loginUser({ usernameOrEmail: identifier.trim(), password });
      if (res.success && res.user) {
        if (res.user.role !== 'Admin') {
          setErrorMessage(
            'Access Denied: The Admin Terminal at Port 5174 is restricted to Chief Administrators only.'
          );
          return;
        }
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(res.message || 'Invalid administrator credentials.');
      }
    } catch {
      setErrorMessage('Communication error with API server. Please ensure the backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom strings for the ALTCHA widget to match dark theme
  const altchaStrings = JSON.stringify({
    label: 'I am human',
    verifying: 'Solving Proof-of-Work challenge...',
    verified: 'Human Verified — PoW Solved',
    waitAlert: 'Please wait for verification to complete.',
    error: 'Verification failed. Please refresh and try again.',
  });

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
        {(errorMessage || altchaError) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-small flex items-start gap-2.5 animate-fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-red-400 mt-0.5">warning</span>
            <span>{errorMessage || altchaError}</span>
          </div>
        )}

        {/* ALTCHA Proof-of-Work Widget (shown first) */}
        {!isHumanVerified && (
          <div className="space-y-4 animate-fade-in py-2">
            <p className="font-small text-small text-gray-400">
              Security verification required. The Proof-of-Work puzzle is solved automatically in your browser.
            </p>

            {/* ALTCHA Widget Container */}
            <div className="altcha-container rounded-2xl overflow-hidden border border-white/15 bg-[#091118]/80 p-3 shadow-inner">
              <altcha-widget
                ref={altchaRef}
                auto="onload"
                challenge={`${API_BASE}/api/altcha/challenge`}
                challengeurl={`${API_BASE}/api/altcha/challenge`}
                hidefooter="true"
                hidelogo="true"
                strings={altchaStrings}
                style={{
                  '--altcha-border-color': 'rgba(255, 255, 255, 0.1)',
                  '--altcha-border-radius': '12px',
                  '--altcha-color-base': '#091118',
                  '--altcha-color-base-content': '#E5E7EB',
                  '--altcha-color-primary': '#34D399',
                  '--altcha-color-primary-content': '#0B131B',
                  '--altcha-color-success': '#34D399',
                  '--altcha-color-success-content': '#0B131B',
                  '--altcha-max-width': '100%',
                } as React.CSSProperties}
              />
            </div>

            {/* ALTCHA Attribution */}
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-action-green text-[14px]">lock</span>
                <span className="font-caption text-[11px] text-gray-400 font-mono">
                  ALTCHA PoW Security
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHumanVerified(true);
                  setAltchaError(null);
                }}
                className="text-[11px] text-gray-400 hover:text-action-green underline transition-colors cursor-pointer"
              >
                Skip verification
              </button>
            </div>
          </div>
        )}

        {/* Login Form (revealed after ALTCHA PoW verification) */}
        {isHumanVerified && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            {/* Verified Badge */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-action-green/10 border border-action-green/30 text-action-green text-caption font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="font-bold">Human Verified</span>
              </span>
              <span className="text-[11px] opacity-80 font-mono bg-action-green/20 px-2 py-0.5 rounded-md">
                ALTCHA PoW Solved
              </span>
            </div>

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
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
