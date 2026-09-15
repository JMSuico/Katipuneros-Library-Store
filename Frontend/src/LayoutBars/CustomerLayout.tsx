// [Layer: LayoutBars]
// CustomerLayout.tsx -- Layout wrapper for the Customer panel.
// Renders CustomerHeader + Outlet (no sidebar -- top nav per design.md §51).
// DO NOT put business logic here.
import { Outlet } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';

const CustomerLayout: React.FC = () => {
  return (
    <div className="bg-surface-container-low font-body text-text-primary min-h-screen">
      <CustomerHeader />
      <main className="w-full pt-20 px-gutter">
        <div className="flex flex-col w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
