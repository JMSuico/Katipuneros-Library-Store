// [Layer: LayoutBars]
// AdminLayout.tsx -- Layout wrapper for the Admin panel.
// Renders AdminSidebar (fixed left w-64) + AdminTopBar + Outlet.
// Content offset: pl-64 to avoid sidebar overlap per source HTML.
// DO NOT put business logic here.
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const AdminLayout: React.FC = () => {
  return (
    <div className="bg-surface-container-low font-body text-body text-on-surface antialiased min-h-screen">
      <AdminSidebar />
      <div className="pl-64">
        <AdminTopBar />
        <main className="relative pt-16 w-full min-h-screen bg-surface-container-low">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
