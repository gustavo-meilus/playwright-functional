import { chromium } from 'playwright';
import { join } from 'path';
import { mkdirSync } from 'fs';

/**
 * Script to record HAR files for login and registration flows.
 * Run with: npx tsx scripts/record-har.ts
 */
async function recordHAR() {
  const harDir = join(__dirname, '..', 'har');
  mkdirSync(harDir, { recursive: true });
  const loginHarPath = join(harDir, 'login.har');
  const registerHarPath = join(harDir, 'register.har');

  // Record login HAR
  await recordLoginHAR(loginHarPath);

  // Record registration HAR
  await recordRegisterHAR(registerHarPath);
}

/**
 * Records login flow HAR file.
 */
async function recordLoginHAR(harPath: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    recordHar: {
      path: harPath,
      mode: 'minimal',
    },
  });

  const page = await context.newPage();

  try {
    // Record successful login flow
    console.log('Recording successful login flow...');
    await page.goto('https://practice.expandtesting.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('textbox', { name: 'Username' }).fill('practice');
    await page
      .getByRole('textbox', { name: 'Password' })
      .fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/secure/, { timeout: 15000 });

    // Logout before recording error flows
    const logoutLink = page.getByRole('link', { name: 'Logout' });
    if (await logoutLink.isVisible().catch(() => false)) {
      await logoutLink.click();
      await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
    }

    // Record error flow (invalid username)
    console.log('Recording invalid username flow...');
    await page.goto('https://practice.expandtesting.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('textbox', { name: 'Username' }).fill('wrongUser');
    await page
      .getByRole('textbox', { name: 'Password' })
      .fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();
    await page
      .getByText('Invalid username.', { exact: false })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Record error flow (invalid password)
    console.log('Recording invalid password flow...');
    await page.goto('https://practice.expandtesting.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('textbox', { name: 'Username' }).fill('practice');
    await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await page
      .getByText('Invalid password.', { exact: false })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    console.log(`✅ Login HAR file recorded: ${harPath}`);
  } catch (error) {
    console.error('❌ Error recording login HAR:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Records registration flow HAR file.
 */
async function recordRegisterHAR(harPath: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    recordHar: {
      path: harPath,
      mode: 'minimal',
    },
  });

  const page = await context.newPage();

  try {
    // Record successful registration flow
    console.log('Recording successful registration flow...');
    await page.goto('https://practice.expandtesting.com/register', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    // Use unique username with timestamp to avoid conflicts
    const uniqueUsername = `newuser${Date.now()}`;
    await page.getByRole('textbox', { name: 'Username' }).fill(uniqueUsername);
    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: 'Confirm Password' })
      .fill('NewPassword123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/login/, { timeout: 20000 });

    // Record error flow (missing username)
    console.log('Recording missing username flow...');
    await page.goto('https://practice.expandtesting.com/register', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    // Leave username blank
    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('TestPassword123!');
    await page
      .getByRole('textbox', { name: 'Confirm Password' })
      .fill('TestPassword123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await page
      .getByText('All fields are required.', { exact: false })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Record error flow (missing password)
    console.log('Recording missing password flow...');
    await page.goto('https://practice.expandtesting.com/register', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('textbox', { name: 'Username' }).fill('testuser');
    // Leave password blank
    await page
      .getByRole('textbox', { name: 'Confirm Password' })
      .fill('TestPassword123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await page
      .getByText('All fields are required.', { exact: false })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Record error flow (non-matching passwords)
    console.log('Recording non-matching passwords flow...');
    await page.goto('https://practice.expandtesting.com/register', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page
      .getByRole('textbox', { name: 'Username' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('textbox', { name: 'Username' }).fill('testuser');
    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('TestPassword123!');
    await page
      .getByRole('textbox', { name: 'Confirm Password' })
      .fill('DifferentPassword456!');
    await page.getByRole('button', { name: 'Register' }).click();
    await page
      .getByText('Passwords do not match.', { exact: false })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    console.log(`✅ Registration HAR file recorded: ${harPath}`);
  } catch (error) {
    console.error('❌ Error recording registration HAR:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

recordHAR().catch(console.error);
