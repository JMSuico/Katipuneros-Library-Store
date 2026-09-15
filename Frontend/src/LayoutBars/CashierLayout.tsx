// [Layer: LayoutBars]
// CashierLayout.tsx -- Layout wrapper for the Cashier panel.
// Renders CashierSidebar (fixed left w-72) + CashierTopBar + Outlet.
// Content offset: pl-72 to avoid sidebar overlap per source HTML.
// DO NOT put business logic here.
import { Outlet } from 'react-router-dom';
import CashierSidebar from './CashierSidebar';
import CashierTopBar from './CashierTopBar';

const CashierLayout: React.FC = () => {
  return (
    <div className="bg-surface-container-low font-body text-body text-on-surface antialiased min-h-screen">
      <CashierSidebar />
      <div className="pl-72">
        <CashierTopBar />
        <main className="relative pt-16 w-full px-gutter min-h-screen">
          <div className="flex flex-col w-full pb-16 space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CashierLayout;
