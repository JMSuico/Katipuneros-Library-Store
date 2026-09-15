// [Layer: LayoutBars]
// CashierTopBar.tsx -- Fixed top bar for the Cashier panel.
// Renders station indicator, global search input, shift indicator, alerts, and profile pill.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

const CashierTopBar: FC = () => {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg gap-space-md">
      <div className="flex items-center gap-space-md flex-1">
        <button
          aria-label="Toggle Navigation Menu"
          className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden xl:flex items-center gap-space-xs text-text-secondary font-caption text-caption">
          <span className="font-medium">Station:</span>
          <span className="inline-flex items-center gap-1 bg-soft-blue text-primary font-bold px-space-sm py-0.5 rounded-full">
            Front Desk Bay 01 • Live Sync
          </span>
        </div>
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-text-secondary text-lg">search</span>
            <input
              className="w-full pl-9 pr-4 py-2 bg-surface-container-highest/60 focus:bg-surface-container-lowest text-on-surface placeholder:text-text-secondary font-small text-small rounded-full outline-none transition-colors"
              placeholder="Scan barcode, ISBN, Customer ID, or Hold Code (Press ⌘K)..."
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="hidden 2xl:flex items-center gap-space-xs font-caption text-caption text-text-secondary bg-surface-container px-space-sm py-1 rounded-full">
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>Monday, Oct 26, 2026 • 09:42 AM</span>
        </div>
        <div className="hidden lg:inline-flex items-center gap-1.5 bg-action-green text-text-primary px-space-sm py-1 rounded-full font-caption text-caption font-bold">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Shift Active (Head Desk)</span>
        </div>
        <button
          aria-label="View alerts"
          className="relative p-space-xs rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-danger"></span>
        </button>
        <div className="flex items-center gap-space-sm pl-space-xs">
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-small text-small font-bold text-on-surface leading-tight">Elena Vance</span>
            <span className="font-caption text-caption text-text-secondary leading-none">Cashier Desk #1</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CashierTopBar;
