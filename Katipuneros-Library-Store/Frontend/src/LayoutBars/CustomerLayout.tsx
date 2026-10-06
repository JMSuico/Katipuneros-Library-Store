// [Layer: LayoutBars]
// CustomerLayout.tsx -- Layout wrapper for the Customer panel.
// Renders CustomerHeader + Outlet (no sidebar -- top nav per design.md §51).
// Governs generous padding and centering across all 6 Customer modules.
// DO NOT put business logic here.

import { Outlet } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';

const CustomerLayout: React.FC = () => {
  return (
    <div className="bg-surface-container-low font-body text-text-primary min-h-screen">
      <CustomerHeader />
      <main className="w-full pt-24 pb-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
