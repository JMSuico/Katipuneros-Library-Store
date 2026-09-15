// [Layer: LayoutBars]
// AdminTopBar.tsx -- Fixed top bar for the Admin panel.
// Renders breadcrumbs, global search, notification alerts, and Administrator profile badge.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

const AdminTopBar: FC = () => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg">
      <div className="flex items-center gap-space-md">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          title="Toggle Sidebar"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">menu_open</span>
        </button>
        <nav className="hidden sm:flex items-center gap-space-xs text-caption font-caption text-text-secondary">
          <span className="hover:text-text-primary cursor-pointer transition-colors">Admin</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Console</span>
        </nav>
      </div>

      <div className="flex items-center gap-space-lg">
        <div className="relative hidden md:block w-72 lg:w-96">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low pl-10 pr-space-md py-2 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search users, books, reservations..."
            type="text"
          />
        </div>
        <button
          className="relative p-2 text-text-secondary hover:bg-surface-container hover:text-on-surface rounded-full transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center gap-space-sm pl-space-sm bg-surface-container-low py-1 px-space-sm rounded-full">
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg"
          />
          <div className="hidden lg:flex flex-col pr-space-xs">
            <span className="font-small text-small font-semibold text-text-primary leading-tight">
              Administrator
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
