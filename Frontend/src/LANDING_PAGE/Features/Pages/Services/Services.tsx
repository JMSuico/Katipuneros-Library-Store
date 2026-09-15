// [Layer: LANDING_PAGE/Features/Pages/Services]
// Services.tsx -- Route entry page for library services.
// Route-level composition ONLY -- no business logic.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';
import ServicesSection from './Components/ServicesSection';

const Services: FC = () => {
  return (
    <div className="pt-16">
      <ServicesSection />
    </div>
  );
};

export default Services;
