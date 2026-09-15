// [Layer: Libs/Assets]
// data.ts -- Global constants, static arrays, and operational schedule data.
// DO NOT put UI components or business logic here.

export const OPERATING_HOURS = {
  WEEKDAYS: 'Monday – Friday: 7:30 AM – 8:00 PM',
  SATURDAY: 'Saturday: 8:00 AM – 5:00 PM',
  SUNDAY: 'Sunday: Closed (Virtual Catalog 24/7)',
};

export const LIBRARY_SERVICES = [
  {
    icon: 'local_library',
    title: 'Physical Borrowing & Circulation',
    description: 'Borrow up to 5 books concurrently for a 14-day renewal period using your student or faculty badge.',
    tag: 'Core Service',
  },
  {
    icon: 'menu_book',
    title: 'Digital & Open-Access Research',
    description: 'Direct portal to university academic databases, international journal archives, and e-theses.',
    tag: 'Research',
  },
  {
    icon: 'group',
    title: 'Collaborative Study Pods',
    description: 'Book sound-dampened meeting pods equipped with whiteboards, 4K displays, and power hubs.',
    tag: 'Facilities',
  },
  {
    icon: 'laptop_chromebook',
    title: 'Digital Terminal Lab',
    description: '30 high-speed terminals with CAD, statistics software, programming IDEs, and printing credits.',
    tag: 'Technology',
  },
];
