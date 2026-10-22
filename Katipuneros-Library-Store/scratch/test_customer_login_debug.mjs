import { chromium } from '../Frontend/node_modules/playwright/index.mjs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLogin() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('request', req => console.log('REQUEST SENT:', req.method(), req.url(), req.postData()));
  page.on('response', async res => {
    console.log('RESPONSE RECEIVED:', res.status(), res.url());
  });

  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const textInput = page.locator('input[type="text"]').first();
  const passInput = page.locator('input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();

  console.log('Submit button text:', await submitBtn.textContent());

  await textInput.fill('custsuperuser1@katipuneros.edu.ph');
  await passInput.fill('CustPass123!');

  console.log('Identifier value in DOM:', await textInput.inputValue());
  console.log('Password value in DOM:', await passInput.inputValue());

  console.log('Clicking submit...');
  await submitBtn.click();

  await page.waitForTimeout(3000);
  console.log('Final URL:', page.url());

  const errs = await page.locator('div.text-status-danger, div[class*="danger"], span:has-text("error")').allTextContents();
  console.log('ERROR TEXTS:', errs);

  await browser.close();
}

testLogin();
