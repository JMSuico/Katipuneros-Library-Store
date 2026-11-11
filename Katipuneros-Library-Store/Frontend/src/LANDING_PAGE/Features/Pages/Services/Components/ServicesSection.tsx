// [Layer: LANDING_PAGE/Features/Pages/Services/Components]
// ServicesSection.tsx -- Public landing page services grid with scholastic service cards.
// Converted directly from LandingPage/code.html lines 386-481.
// DO NOT put business logic or API calls here.
import { FC } from 'react';
import { Link } from 'react-router-dom';

export interface ServiceItem {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  linkText: string;
  cta: string;
  route: string;
  href: string;
  anchor: string;
}

export const ServicesSection: FC = () => {
  const services: ServiceItem[] = [
    {
      icon: 'local_library',
      iconBg: 'bg-secondary-container/80 text-primary',
      title: 'Browse Books',
      description:
        'Explore the complete library collection across 18 scholastic disciplines with real-time stack coordinates and digital summaries.',
      linkText: 'Explore catalog',
      cta: 'Explore catalog',
      route: '/products',
      href: '/products',
      anchor: '#products',
    },
    {
      icon: 'bookmark',
      iconBg: 'bg-action-green/30 text-text-primary',
      title: 'Reserve Books',
      description:
        'Reserve available books for your preferred pickup schedule with guaranteed 72-hour holds and direct desk notifications.',
      linkText: 'Place instant hold',
      cta: 'Place instant hold',
      route: '/products',
      href: '/products',
      anchor: '#products',
    },
    {
      icon: 'schedule',
      iconBg: 'bg-soft-blue text-primary',
      title: 'Track Reservations',
      description:
        'Monitor pending, approved, and completed reservations with live desk updates and automated SMS/email alerts.',
      linkText: 'View schedules',
      cta: 'View schedules',
      route: '/about',
      href: '/about',
      anchor: '#contact',
    },
    {
      icon: 'badge',
      iconBg: 'bg-primary-fixed text-primary',
      title: 'Manage Borrowing',
      description:
        'Review your active and previous borrowing records, due dates, loan extensions, and digital receipt archives.',
      linkText: 'Borrower dashboard',
      cta: 'Borrower dashboard',
      route: '/customer/borrowings',
      href: '/customer/borrowings',
      anchor: '/customer/borrowings',
    },
    {
      icon: 'auto_awesome',
      iconBg: 'bg-[#FEF08A]/60 text-[#854D0E]',
      title: 'Discover Recommendations',
      description:
        'Find books tailored to your academic focus, research topics, and popular peer reading syllabi across departments.',
      linkText: 'View curations',
      cta: 'View curations',
      route: '/products',
      href: '/products',
      anchor: '#products',
    },
    {
      icon: 'support_agent',
      iconBg: 'bg-secondary-fixed text-primary',
      title: 'Library Assistance',
      description:
        'Direct assistance with archival accessioning, Dewey concordances, research citations, and borrowing policies.',
      linkText: 'Contact desk',
      cta: 'Contact desk',
      route: '/about',
      href: '/about',
      anchor: '#contact',
    },
  ];

  return (
    <section className="w-full py-space-3xl px-gutter relative" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="font-caption text-caption tracking-widest uppercase text-primary font-semibold">
            SCHOLASTIC SERVICES
          </span>
          <h2 className="font-headline-2 text-headline-2 text-text-primary mt-1 mb-space-sm">
            Everything You Need to Discover and Borrow
          </h2>
          <p className="font-body text-body text-text-secondary">
            A modern library experience designed around discovering books, reserving them, and managing your
            reading journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {services.map((svc) => (
            <Link
              key={svc.title}
              to={svc.route}
              aria-label={`${svc.title} - ${svc.cta}`}
              className="group p-space-xl rounded-3xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between block cursor-pointer border border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/50"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl ${svc.iconBg} flex items-center justify-center mb-space-lg group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-[30px]">{svc.icon}</span>
                </div>
                <h3 className="font-headline-3 text-headline-4 text-text-primary mb-space-xs font-semibold">
                  {svc.title}
                </h3>
                <p className="font-body text-body text-text-secondary">{svc.description}</p>
              </div>
              <div className="mt-space-lg flex items-center gap-1.5 text-xs font-semibold text-[#8B0000] group-hover:translate-x-1 group-hover:gap-2 transition-all duration-200">
                <span>{svc.cta || svc.linkText}</span>
                <span
                  className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
