// [Layer: Features/Auth]
// SignupPage.tsx -- Sliding-Window Customer Registration with Multi-Phase Validation.
// Phase 1: Personal Information (Strict Validation for NEXT button).
// Phase 2: Account Credentials with Password Visibility Toggles & Floating Success Modal.
// Expresses all sync and async routines via clean lambda expressions.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../Endpoints/authApi';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  // Sliding Window Step: 1 = Personal Info, 2 = Credentials
  const [phase, setPhase] = useState<1 | 2>(1);

  // Phase 1 Fields: Personal Information
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Student');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(false);

  // Phase 2 Fields: Account Credentials
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');

  // Phase 1 Validation: All required personal info fields must be populated
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

  const handleCurrentAddressChange = (value: string) => {
    setCurrentAddress(value);
    if (sameAddress) {
      setPermanentAddress(value);
    }
  };

  const handleNextPhase = () => {
    if (!isPhase1Valid) return;
    setErrorMessage(null);
    setPhase(2);
  };

  const handlePreviousPhase = () => {
    setErrorMessage(null);
    setPhase(1);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validations
    if (!email.trim() || !username.trim() || !password || !confirmPassword) {
      setErrorMessage('All credential fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    // Launch floating modal card with loading animation
    setModalStatus('loading');
    setShowSuccessModal(true);

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
        password,
      });

      if (res.success) {
        // Reflect successful DB registration in floating modal
        setModalStatus('success');
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/customer/home');
        }, 1800);
      } else {
        setShowSuccessModal(false);
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch {
      setShowSuccessModal(false);
      setErrorMessage('Network connection failure. Ensure the .NET 10 API backend is online.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-action-green/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary-container/50 blur-3xl pointer-events-none" />

      {/* Main Registration Card */}
      <div className="relative w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl my-8 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <div>
              <h1 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                Katipuneros Library
              </h1>
              <span className="font-caption text-caption text-text-secondary">
                Academic Patron Enrolment
              </span>
            </div>
          </Link>
          <span className="font-caption text-caption font-semibold px-3 py-1 rounded-full bg-surface-container text-primary">
            CUSTOMER REGISTRATION
          </span>
        </div>

        {/* Phase Indicator Ribbon */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-caption text-caption font-bold uppercase tracking-wider text-primary">
              {phase === 1 ? 'Phase 1 of 2: Personal Information' : 'Phase 2 of 2: Account Credentials'}
            </span>
            <span className="font-caption text-caption text-text-secondary">
              {phase === 1 ? 'Step 1 / 2' : 'Step 2 / 2'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-action-green transition-all duration-500 ease-out"
              style={{ width: phase === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-headline-2 text-headline-2 text-text-primary font-bold">
            {phase === 1 ? 'Personal Information' : 'Account Credentials'}
          </h2>
          <p className="font-body text-body text-text-secondary mt-1">
            {phase === 1
              ? 'Please provide your full legal name, university employment/student standing, and residential addresses.'
              : 'Configure your institutional email, unique username, and private access password.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-small flex items-start gap-2.5 animate-shake">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sliding Window Forms */}
        <div className="relative overflow-hidden">
          {/* ═══════════════════════════════════════════════════════════
              PHASE 1: PERSONAL INFORMATION
              ═══════════════════════════════════════════════════════════ */}
          {phase === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                    First Name <span className="text-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                    Middle Name <span className="text-text-secondary text-[11px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Protacio"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                    Last Name / Surname <span className="text-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                    Employment Status <span className="text-status-danger">*</span>
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  >
                    <option value="Student">Student (Undergraduate / Graduate)</option>
                    <option value="Employee">Employee (Corporate / Industry)</option>
                    <option value="Unemployed">Unemployed / Independent Scholar</option>
                    <option value="Faculty / Academic Staff">Faculty / Academic Staff</option>
                    <option value="Research Scholar">Research Scholar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Current Address <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentAddress}
                  onChange={(e) => handleCurrentAddressChange(e.target.value)}
                  placeholder="Street address, barangay, city/municipality"
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => handleSameAddressChange(e.target.checked)}
                    className="w-4 h-4 rounded text-action-green focus:ring-action-green accent-primary cursor-pointer"
                  />
                  <span className="font-small text-small text-text-primary font-medium">
                    Permanent Address is the same as Current Address
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Permanent Address <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={sameAddress}
                  value={sameAddress ? currentAddress : permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Permanent provincial / home address"
                  className={`w-full px-4 py-3 rounded-2xl border text-small transition-all shadow-inner ${
                    sameAddress
                      ? 'bg-surface-container text-text-secondary border-outline-variant/20 cursor-not-allowed'
                      : 'bg-surface-container-low border border-outline-variant/40 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white'
                  }`}
                />
              </div>

              {/* Navigation Buttons for Phase 1 */}
              <div className="flex items-center justify-between pt-6 border-t border-surface-container-high gap-4">
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>BACK TO LOGIN</span>
                </Link>

                <button
                  type="button"
                  onClick={handleNextPhase}
                  disabled={!isPhase1Valid}
                  className={`px-7 py-3 rounded-2xl font-body-medium text-small font-bold transition-all flex items-center gap-2 ${
                    isPhase1Valid
                      ? 'bg-action-green hover:bg-action-green-hover text-text-primary shadow-md active:scale-95 cursor-pointer'
                      : 'bg-surface-container-high/60 text-text-secondary/50 border border-outline-variant/20 cursor-not-allowed'
                  }`}
                  title={!isPhase1Valid ? 'Please complete all required fields in this phase to continue' : 'Proceed to Account Credentials'}
                >
                  <span>NEXT</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              PHASE 2: ACCOUNT CREDENTIALS
              ═══════════════════════════════════════════════════════════ */}
          {phase === 2 && (
            <form onSubmit={handleCreateAccount} className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Institutional Email Address <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron.scholar@katipuneros.edu.ph"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Username <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="juandelacruz26"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Password <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary mb-1.5 font-semibold">
                  Confirm Password <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                    lock_reset
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-12 pr-12 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-text-primary text-small focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Navigation Buttons for Phase 2 */}
              <div className="flex items-center justify-between pt-6 border-t border-surface-container-high gap-4">
                <button
                  type="button"
                  onClick={handlePreviousPhase}
                  className="px-5 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>PREVIOUS</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-small font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>CREATE</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-8 pt-4 border-t border-surface-container-high text-center">
          <p className="font-small text-small text-text-secondary">
            Already have an active library card?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In to your account
            </Link>
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FLOATING MODAL CARD WITH LOADING ANIMATION & SUCCESS STATUS
          ═══════════════════════════════════════════════════════════ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm p-8 bg-surface-container-lowest/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl flex flex-col items-center text-center">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-action-green to-secondary rounded-t-3xl" />

            {modalStatus === 'loading' ? (
              <div className="flex flex-col items-center py-6 gap-4">
                <div className="w-14 h-14 border-4 border-action-green border-t-transparent rounded-full animate-spin shadow-md" />
                <div>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                    Creating Account...
                  </h3>
                  <p className="font-small text-small text-text-secondary mt-1">
                    Storing customer entity in database and provisioning patron clearance...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-4 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-action-green/20 text-action-green flex items-center justify-center border border-action-green/40 shadow-inner">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                    Account Created Successfully
                  </h3>
                  <p className="font-small text-small text-text-secondary mt-1">
                    Welcome to Katipuneros Library! Redirecting to your patron dashboard...
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

export default SignupPage;
