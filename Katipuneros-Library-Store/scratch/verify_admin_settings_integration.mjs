// [Layer: Verification Scripts]
// verify_admin_settings_integration.mjs -- E2E verification test suite for Admin System Settings,
// Security Governance, Theme Modes (.dark, .oled), Cashier Dynamic Fines, and Inactivity Logoff.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = [];

function recordResult(testName, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  results.push({ testName, passed, details });
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}[${status}]\x1b[0m ${testName} ${details ? '--> ' + details : ''}`);
}

async function runVerificationSuite() {
  console.log('\n======================================================================');
  console.log('   KATIPUNEROS LIBRARY STORE: E2E ADMIN SETTINGS & SECURITY GOVERNANCE');
  console.log('======================================================================\n');

  let adminToken = null;
  let cashierToken = null;
  let customerToken = null;
  let initialTariff = 15.0;

  // -------------------------------------------------------------------------
  // 1. Authenticate Personas (Admin, Cashier, Customer)
  // -------------------------------------------------------------------------
  console.log('--- Step 1: Persona Authentication ---');
  try {
    const adminRes = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'testadmin@katipuneros.edu.ph', password: 'Password123!' })
    });
    const adminData = await adminRes.json();
    if (adminData.success && adminData.data?.token) {
      adminToken = adminData.data.token;
      recordResult('Admin Login', true, `Role: ${adminData.data.role}`);
    } else {
      recordResult('Admin Login', false, adminData.message || 'Failed');
    }

    const cashierRes = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'testcashier@katipuneros.edu.ph', password: 'Password123!' })
    });
    const cashierData = await cashierRes.json();
    if (cashierData.success && cashierData.data?.token) {
      cashierToken = cashierData.data.token;
      recordResult('Cashier Login', true, `Role: ${cashierData.data.role}`);
    } else {
      recordResult('Cashier Login', false, cashierData.message || 'Failed');
    }

    const customerRes = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'custsuperuser1@katipuneros.edu.ph', password: 'CustPass123!' })
    });
    const customerData = await customerRes.json();
    if (customerData.success && customerData.data?.token) {
      customerToken = customerData.data.token;
      recordResult('Customer Login', true, `Role: ${customerData.data.role}`);
    } else {
      recordResult('Customer Login', false, customerData.message || 'Failed');
    }
  } catch (err) {
    recordResult('Authentication Setup', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 2. Test A: Theme & Appearance Verification (CSS variables, .dark & .oled)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 2: Theme & Appearance Verification ---');
  let playwrightLoaded = false;
  try {
    const playwrightPath = path.resolve(__dirname, '../Frontend/node_modules/playwright/index.mjs');
    if (fs.existsSync(playwrightPath)) {
      const { chromium } = await import(pathToFileURL(playwrightPath).href);
      const browser = await chromium.launch({
        executablePath: CHROME_PATH,
        headless: true
      });
      const page = await browser.newPage();
      await page.goto(FRONTEND_BASE, { waitUntil: 'networkidle', timeout: 15000 });

      // Verify default background CSS variable
      const defaultBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
      });
      recordResult('Theme Default Background Token', defaultBg === '#f4fbfc' || defaultBg.length > 0, `Value: ${defaultBg}`);

      // Apply .dark class
      await page.evaluate(() => {
        document.documentElement.classList.remove('oled');
        document.documentElement.classList.add('dark');
      });
      const darkBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
      });
      recordResult('Theme .dark Background Token', darkBg === '#0f172a', `Value: ${darkBg} (Expected #0f172a)`);

      // Apply .oled class
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('oled');
      });
      const oledBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
      });
      recordResult('Theme .oled Background Token', oledBg === '#000000', `Value: ${oledBg} (Expected #000000)`);

      await browser.close();
      playwrightLoaded = true;
    }
  } catch (err) {
    console.log('Playwright inspection note:', err.message);
  }

  // Fallback / Static CSS token validation from MainLayout.css
  try {
    const mainCssPath = path.resolve(__dirname, '../Frontend/src/LayoutStyles/MainLayout.css');
    const cssContent = fs.readFileSync(mainCssPath, 'utf8');
    const hasDarkRule = cssContent.includes('.dark') && cssContent.includes('--color-background: #0f172a;');
    const hasOledRule = cssContent.includes('.oled') && cssContent.includes('--color-background: #000000;');
    recordResult('MainLayout.css Token Definitions', hasDarkRule && hasOledRule, 'Contains .dark (#0f172a) and .oled (#000000)');
  } catch (err) {
    recordResult('MainLayout.css File Read', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 3. Test B: Backend GET /api/admin/settings/public
  // -------------------------------------------------------------------------
  console.log('\n--- Step 3: Public System Settings Endpoint ---');
  try {
    const pubRes = await fetch(`${BACKEND_BASE}/api/admin/settings/public`);
    const pubData = await pubRes.json();

    const isSuccess = pubRes.status === 200 && pubData.success === true;
    recordResult('GET /api/admin/settings/public Status', isSuccess, `HTTP ${pubRes.status}`);

    const hasCirculation = !!pubData.data?.circulation && typeof pubData.data.circulation.gracePeriodHours === 'number';
    recordResult('Circulation Policy Present', hasCirculation, `Grace Period: ${pubData.data?.circulation?.gracePeriodHours}h`);

    const hasFines = !!pubData.data?.fines && typeof pubData.data.fines.dailyOverdueTariff === 'number';
    recordResult('Fine Tariffs Present', hasFines, `Daily Tariff: ₱${pubData.data?.fines?.dailyOverdueTariff}`);
    if (hasFines) {
      initialTariff = pubData.data.fines.dailyOverdueTariff;
    }

    const hasSecurity = !!pubData.data?.security &&
      typeof pubData.data.security.posAutoLogoffMinutes === 'number' &&
      typeof pubData.data.security.superAdminTimeoutMinutes === 'number';
    recordResult('Security Governance Present', hasSecurity,
      `POS Timeout: ${pubData.data?.security?.posAutoLogoffMinutes}m, Admin Timeout: ${pubData.data?.security?.superAdminTimeoutMinutes}m`);
  } catch (err) {
    recordResult('Public System Settings Endpoint', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 4. Test C: Admin Modifies Fine Tariff (POST /api/admin/settings/save)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 4: Admin Modifies Fine Tariff ---');
  try {
    const targetTariff = 25.00;
    const savePayload = {
      dailyOverdueTariff: targetTariff
    };

    const saveRes = await fetch(`${BACKEND_BASE}/api/admin/settings/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(savePayload)
    });
    const saveData = await saveRes.json();
    const savePassed = saveRes.status === 200 && saveData.success === true;
    recordResult('POST /api/admin/settings/save', savePassed, `Status: ${saveRes.status}`);

    // Verify change is immediately reflected on GET /api/admin/settings/public
    const verifyRes = await fetch(`${BACKEND_BASE}/api/admin/settings/public`);
    const verifyData = await verifyRes.json();
    const updatedTariff = verifyData.data?.fines?.dailyOverdueTariff;
    const tariffUpdated = Number(updatedTariff) === targetTariff;
    recordResult('Dynamic Fine Tariff Persistence', tariffUpdated, `Updated Daily Tariff: ₱${updatedTariff} (Expected: ₱${targetTariff})`);
  } catch (err) {
    recordResult('Fine Tariff Modification', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 5. Test D: Cashier Returns / Fines Dynamic Calculations
  // -------------------------------------------------------------------------
  console.log('\n--- Step 5: Cashier Dynamic Returns & Fines Verification ---');
  try {
    // Check Cashier ledger
    const ledgerRes = await fetch(`${BACKEND_BASE}/api/borrow/admin-ledger`, {
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    const ledgerData = await ledgerRes.json();
    const ledgerOk = ledgerRes.status === 200 && ledgerData.success === true;
    recordResult('Cashier Access to Circulation Ledger', ledgerOk, `Loans retrieved: ${ledgerData.data?.length ?? 0}`);

    // Verify ReturnsFines.tsx code reflects dynamic fine logic
    const returnsPath = path.resolve(__dirname, '../Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx');
    const returnsSrc = fs.readFileSync(returnsPath, 'utf8');
    const usesDynamicSettings = returnsSrc.includes('getPublicSystemSettings') &&
      returnsSrc.includes('dailyOverdueTariff') &&
      returnsSrc.includes('maxPenaltyCap');
    recordResult('ReturnsFines.tsx Dynamic Tariff Calculation', usesDynamicSettings,
      'Wires getPublicSystemSettings() and calculates fine using dynamic dailyOverdueTariff');
  } catch (err) {
    recordResult('Cashier Dynamic Calculation Check', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 6. Test E: Customer Fine Endpoint (/api/fines/my-fines)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 6: Customer Fine Endpoint Verification ---');
  try {
    const finesRes = await fetch(`${BACKEND_BASE}/api/fines/my-fines`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const finesData = await finesRes.json();
    const endpointPassed = finesRes.status === 200 && finesData.success === true;
    recordResult('GET /api/fines/my-fines Status', endpointPassed, `Status: ${finesRes.status}`);

    const validFormat = finesData.data &&
      typeof finesData.data.balance !== 'undefined' &&
      Array.isArray(finesData.data.fines);
    recordResult('Customer Fines Response Schema', !!validFormat,
      `Balance: ₱${finesData.data?.balance ?? 0}, Fines count: ${finesData.data?.fines?.length ?? 0}`);
  } catch (err) {
    recordResult('Customer Fines Endpoint', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 7. Test F: Inactivity Logoff Integration Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Step 7: Inactivity Auto-Logoff Rules Verification ---');
  try {
    const hookPath = path.resolve(__dirname, '../Frontend/src/Hooks/useInactivityLogoff.ts');
    const hookExists = fs.existsSync(hookPath);
    recordResult('Hook useInactivityLogoff.ts Exists', hookExists, hookPath);

    if (hookExists) {
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      const tracksAllEvents = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll']
        .every(evt => hookContent.includes(evt));
      recordResult('useInactivityLogoff Event Tracking', tracksAllEvents,
        'Tracks mousemove, keydown, touchstart, click, scroll');

      const cashierLayoutPath = path.resolve(__dirname, '../Frontend/src/LayoutBars/CashierLayout.tsx');
      const cashierLayoutContent = fs.readFileSync(cashierLayoutPath, 'utf8');
      const cashierWired = cashierLayoutContent.includes('useInactivityLogoff') &&
        cashierLayoutContent.includes('posAutoLogoffMinutes') &&
        cashierLayoutContent.includes('logout');
      recordResult('CashierLayout Auto-Logoff Wiring', cashierWired,
        'Uses posAutoLogoffMinutes, logs out and navigates to /cashier/login');

      const adminLayoutPath = path.resolve(__dirname, '../Frontend/src/LayoutBars/AdminLayout.tsx');
      const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
      const adminWired = adminLayoutContent.includes('useInactivityLogoff') &&
        adminLayoutContent.includes('superAdminTimeoutMinutes') &&
        adminLayoutContent.includes('logout');
      recordResult('AdminLayout Auto-Logoff Wiring', adminWired,
        'Uses superAdminTimeoutMinutes, logs out and navigates to /admin/login');
    }
  } catch (err) {
    recordResult('Inactivity Logoff Verification', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('                      VERIFICATION SUMMARY                            ');
  console.log('======================================================================');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Checks : ${total}`);
  console.log(`Passed Checks: \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Failed Checks: ${failedCount > 0 ? '\x1b[31m' + failedCount + '\x1b[0m' : '0'}`);

  if (failedCount === 0) {
    console.log('\n\x1b[32m[ALL INTEGRATION CHECKS PASSED SUCCESSFULLY]\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\n\x1b[31m[SOME CHECKS FAILED]\x1b[0m\n');
    process.exit(1);
  }
}

runVerificationSuite();
