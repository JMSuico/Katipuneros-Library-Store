// [Layer: Frontend/scripts]
// postbuild.js -- Multi-route static generator for SPA routing on Render, Vercel, and static hosts.
// Generates physical index.html copies for all direct SPA routes and 404.html fallback.
// Prevents "404 Not Found" when users directly enter deep URLs or refresh pages.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('[postbuild] dist directory not found at', distDir);
  process.exit(1);
}

const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('[postbuild] dist/index.html not found!');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// 1. Copy to 404.html for static host fallback
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml, 'utf8');
console.log('[postbuild] Generated dist/404.html fallback.');

// 2. Physical directory routes to generate for direct deep linking
const routes = [
  // Admin Routes
  'admin/login',
  'admin',
  'admin/dashboard',
  'admin/users',
  'admin/books',
  'admin/reservations',
  'admin/borrowings',
  'admin/returns',
  'admin/inventory',
  'admin/analytics',
  'admin/categories',
  'admin/reports',
  'admin/notifications',
  'admin/roles',
  'admin/audit-logs',
  'admin/settings',
  'admin/profile',

  // Cashier Routes
  'cashier/login',
  'cashier',
  'cashier/dashboard',
  'cashier/checkout',
  'cashier/returns',
  'cashier/customers',
  'cashier/pending-reservations',
  'cashier/book-availability',
  'cashier/inventory',
  'cashier/schedules',
  'cashier/overdue-fines',
  'cashier/transactions',
  'cashier/notifications',
  'cashier/profile',

  // Customer & Auth Routes
  'login',
  'signup',
  'customer',
  'customer/home',
  'customer/catalog',
  'customer/borrowings',
  'customer/reservations',
  'customer/favorites',
  'customer/profile',
  'customer/settings',
  'about',
  'products',
  'contact'
];

routes.forEach((route) => {
  const targetDir = path.join(distDir, route);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtml, 'utf8');
});

console.log(`[postbuild] Generated ${routes.length} physical route fallbacks in dist/.`);
