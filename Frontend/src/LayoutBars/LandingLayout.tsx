// [Layer: LayoutBars]
// LandingLayout.tsx -- Layout wrapper for the public Landing Page.
// Renders LandingHeader + Outlet + Footer.
// DO NOT put business logic here.
import { Outlet } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import Footer from './Footer';

const LandingLayout: React.FC = () => {
  return (
    <div className="bg-background text-text-primary min-h-screen">
      <LandingHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
