// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// AuthModal.tsx -- Patron login and sign up modal for the public landing page.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-space-xl shadow-2xl relative">
        <button
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-container-low mb-space-lg">
          <button
            className={`flex-1 py-2 rounded-xl font-body-medium text-small font-semibold transition-all cursor-pointer ${
              tab === 'signin' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-body-medium text-small font-semibold transition-all cursor-pointer ${
              tab === 'signup' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-action-green/20 text-text-primary font-small text-small flex items-center gap-2">
            <span className="material-symbols-outlined text-action-green-hover text-[20px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        ) : tab === 'signin' ? (
          <div>
            <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mb-1">Welcome Back</h3>
            <p className="font-small text-small text-text-secondary mb-space-lg">
              Access your patron bookshelf, loan logs, and holds.
            </p>
            <button
              className="w-full py-3 px-4 rounded-xl bg-surface-container text-text-primary font-body-medium text-small font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 mb-space-md cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  fill="#EA4335"
                />
                <path
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  fill="#4285F4"
                />
                <path
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  fill="#34A853"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="relative flex items-center justify-center my-4">
              <span className="bg-white/95 px-3 font-caption text-caption text-text-secondary uppercase">
                Or with email
              </span>
              <div className="absolute inset-0 flex items-center -z-10">
                <div className="w-full bg-surface-container h-px"></div>
              </div>
            </div>
            <form className="space-y-3" onSubmit={(e) => handleSubmit(e, 'Signed in successfully!')}>
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Patron Email / ID
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  placeholder="patron@university.edu"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  placeholder="••••••••"
                  required
                  type="password"
                />
              </div>
              <button
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-all shadow-md cursor-pointer"
                type="submit"
              >
                Sign In to Account
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mb-1">Create Patron Card</h3>
            <p className="font-small text-small text-text-secondary mb-space-lg">
              Instant access to 1,000+ catalog titles.
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => handleSubmit(e, 'Account created! Welcome to Katipuneros Library.')}
            >
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Full Legal Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  placeholder="Maria Santos"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Academic Email
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  placeholder="msantos@university.edu.ph"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Create Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  placeholder="Min. 8 characters"
                  required
                  type="password"
                />
              </div>
              <button
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-all shadow-md cursor-pointer"
                type="submit"
              >
                Register Patron Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
