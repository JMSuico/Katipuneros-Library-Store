// [Layer: Shared/Components]
// AuthModal.tsx -- Interactive authentication modal supporting Customer & Cashier login and sliding-window registration.
// Strictly isolates Admin login (port 5174 only) and removes demo credentials.
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../Endpoints/authApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In States
  const [identifier, setIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Sliding Window States: 1 = Personal Info, 2 = Credentials
  const [signUpPhase, setSignUpPhase] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Student');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');

  if (!isOpen) return null;

  // Phase 1 Validation
  const isPhase1Valid = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    employmentStatus.trim() &&
    currentAddress.trim() &&
    (sameAddress || permanentAddress.trim())
  );

  const handleSameAddressChange = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setPermanentAddress(currentAddress);
    }
  };

  const handleCurrentAddressChange = (val: string) => {
    setCurrentAddress(val);
    if (sameAddress) {
      setPermanentAddress(val);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !signInPassword) {
      setErrorMessage('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginUser({ usernameOrEmail: identifier.trim(), password: signInPassword });
      if (res.success && res.user) {
        onClose();
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
      setErrorMessage('Network connection error. Ensure the .NET 10 API backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !username.trim() || !signUpPassword || !confirmPassword) {
      setErrorMessage('All credential fields are required.');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setModalStatus('loading');
    setShowSuccessCard(true);

    try {
      const res = await registerUser({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        employmentStatus: employmentStatus.trim(),
        currentAddress: currentAddress.trim(),
        permanentAddress: (sameAddress ? currentAddress : permanentAddress).trim(),
        email: email.trim(),
        username: username.trim(),
        password: signUpPassword,
      });

      if (res.success) {
        setModalStatus('success');
        setTimeout(() => {
          setShowSuccessCard(false);
          onClose();
          navigate('/customer/home');
        }, 1800);
      } else {
        setShowSuccessCard(false);
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch {
      setShowSuccessCard(false);
      setErrorMessage('Registration network failure. Please verify backend is running.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg p-8 bg-surface-container-lowest/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-action-green to-secondary" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Tab Selector */}
        <div className="flex items-center p-1 bg-surface-container-low rounded-2xl mb-6 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-body-medium text-small font-semibold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-body-medium text-small font-semibold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-small flex items-start gap-2.5 animate-shake">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SIGN IN VIEW
            ═══════════════════════════════════════════════════════════ */}
        {mode === 'signin' && (
          <div>
            <div className="mb-5 text-center">
              <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Welcome Back
              </h3>
              <p className="font-small text-small text-text-secondary mt-1">
                Access your user bookshelf, active holds, or cashier desk.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
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
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    lock
                  </span>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showSignInPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SIGN UP VIEW (SLIDING WINDOW)
            ═══════════════════════════════════════════════════════════ */}
        {mode === 'signup' && (
          <div>
            {/* Sliding Window Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1 text-[11px] font-caption font-bold uppercase tracking-wider text-primary">
                <span>{signUpPhase === 1 ? 'Phase 1: Personal Information' : 'Phase 2: Account Credentials'}</span>
                <span>{signUpPhase === 1 ? '1 / 2' : '2 / 2'}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-action-green transition-all duration-300 ease-out"
                  style={{ width: signUpPhase === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {/* Phase 1: Personal Info */}
            {signUpPhase === 1 && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Juan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Protacio"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                      Last Name / Surname *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dela Cruz"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                      Employment Status *
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    >
                      <option value="Student">Student</option>
                      <option value="Employee">Employee</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Faculty / Academic Staff">Faculty / Academic Staff</option>
                      <option value="Research Scholar">Research Scholar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Current Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentAddress}
                    onChange={(e) => handleCurrentAddressChange(e.target.value)}
                    placeholder="Current address in Katipunan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
                    <input
                      type="checkbox"
                      checked={sameAddress}
                      onChange={(e) => handleSameAddressChange(e.target.checked)}
                      className="w-4 h-4 rounded text-action-green focus:ring-action-green accent-primary cursor-pointer"
                    />
                    <span className="font-caption text-[12px] text-text-primary font-medium">
                      Permanent Address is the same as Current Address
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Permanent Address *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={sameAddress}
                    value={sameAddress ? currentAddress : permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Permanent home address"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-small transition-all ${
                      sameAddress
                        ? 'bg-surface-container text-text-secondary border-outline-variant/20 cursor-not-allowed'
                        : 'bg-surface-container-low border border-outline-variant/40 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Navigation Buttons for Phase 1 */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-container-high gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>BACK TO LOGIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isPhase1Valid) {
                        setErrorMessage(null);
                        setSignUpPhase(2);
                      }
                    }}
                    disabled={!isPhase1Valid}
                    className={`px-6 py-2.5 rounded-xl font-body-medium text-small font-bold transition-all flex items-center gap-1.5 ${
                      isPhase1Valid
                        ? 'bg-action-green hover:bg-action-green-hover text-text-primary shadow-md active:scale-95 cursor-pointer'
                        : 'bg-surface-container-high/60 text-text-secondary/50 border border-outline-variant/20 cursor-not-allowed'
                    }`}
                    title={!isPhase1Valid ? 'Please fill in all required fields' : 'Continue to Credentials'}
                  >
                    <span>NEXT</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Phase 2: Credentials */}
            {signUpPhase === 2 && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@katipuneros.edu.ph"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Username *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="patron2026"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Password *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                      lock
                    </span>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showSignUpPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-caption text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-semibold">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                      lock_reset
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Navigation Buttons for Phase 2 */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-container-high gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSignUpPhase(1);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>PREVIOUS</span>
                  </button>

                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-small font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>CREATE</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Floating Modal Card: Account Created Successfully */}
      {showSuccessCard && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm p-8 bg-surface-container-lowest/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-action-green to-secondary rounded-t-3xl" />

            {modalStatus === 'loading' ? (
              <div className="flex flex-col items-center py-6 gap-4">
                <div className="w-14 h-14 border-4 border-action-green border-t-transparent rounded-full animate-spin shadow-md" />
                <div>
                  <h4 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                    Creating Account...
                  </h4>
                  <p className="font-small text-small text-text-secondary mt-1">
                    Storing customer entity in database and provisioning user clearance...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-4 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-action-green/20 text-action-green flex items-center justify-center border border-action-green/40 shadow-inner">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                  <h4 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                    Account Created Successfully
                  </h4>
                  <p className="font-small text-small text-text-secondary mt-1">
                    Welcome to Katipuneros Library! Redirecting to user dashboard...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;
