import { Page } from '@playwright/test';
import { createInteraction, InteractionStep } from './fp-utils';

/**
 * Navigates to the login page.
 */
export const navigateToLogin: InteractionStep = createInteraction({
  name: 'Navigate to Login Page',
  preCondition: async (page: Page) => {
    const currentUrl = page.url();
    return !currentUrl.includes('/login');
  },
  action: async (page: Page) => {
    await page.goto('https://practice.expandtesting.com/login', {
      waitUntil: 'domcontentloaded', // Keep domcontentloaded for stability
      timeout: 25000, // Reduced from 30s - HAR files make this faster
    });
  },
  postCondition: async (page: Page) => {
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const hasForm = await page
      .getByRole('textbox', { name: 'Username' })
      .isVisible()
      .catch(() => false);
    return isLoginPage && hasForm;
  },
});

/**
 * Fills the username field with the provided value.
 * @param username - The username to enter.
 */
export const fillUsername = (username: string): InteractionStep =>
  createInteraction({
    name: `Fill Username: ${username}`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      return await field.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      await field.clear();
      await field.fill(username);
    },
    postCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      const value = await field.inputValue({ timeout: 3000 }).catch(() => ''); // Reduced from 5s
      return value === username;
    },
  });

/**
 * Fills the password field with the provided value.
 * @param password - The password to enter.
 */
export const fillPassword = (password: string): InteractionStep =>
  createInteraction({
    name: `Fill Password`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password' });
      return await field.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password' });
      await field.clear();
      await field.fill(password);
    },
    postCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password' });
      const value = await field.inputValue({ timeout: 3000 }).catch(() => ''); // Reduced from 5s
      return value === password;
    },
  });

/**
 * Clicks the Login button.
 */
export const clickLogin: InteractionStep = createInteraction({
  name: 'Click Login Button',
  preCondition: async (page: Page) => {
    const button = page.getByRole('button', { name: 'Login' });
    return await button.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
  },
  action: async (page: Page) => {
    const button = page.getByRole('button', { name: 'Login' });
    await button.click(); // Remove explicit timeout - use global actionTimeout
  },
  postCondition: async (page: Page) => {
    // Button click initiated, wait for either navigation to secure page or error message to appear
    try {
      // Wait for navigation to secure page (success case) or error message (failure case)
      await Promise.race([
        page.waitForURL(/\/secure/, { timeout: 10000 }), // Keep at 10s for stability
        page.getByText(/Invalid (username|password)\./, { exact: false }).waitFor({ state: 'visible', timeout: 10000 }), // Keep at 10s for stability
      ]).catch(() => {});
    } catch {
      // Continue if neither condition is met
    }
    return true;
  },
});

/**
 * Verifies the user is on the secure page with success message.
 */
export const verifySecurePage: InteractionStep = createInteraction({
  name: 'Verify Secure Page',
  preCondition: async (page: Page) => {
    await page.waitForURL(/\/secure/, { timeout: 12000 }).catch(() => {}); // Reduced from 15s but still safe
    return true;
  },
  action: async (page: Page) => {
    return;
  },
  postCondition: async (page: Page) => {
    const url = page.url();
    const isSecurePage = url.includes('/secure');
    if (!isSecurePage) return false;

    // Wait for elements to be visible with timeout
    const hasSuccessMessage = await page
      .getByText('You logged into a secure area!', { exact: false })
      .isVisible({ timeout: 8000 }) // Reduced from 10s but still safe
      .catch(() => false);
    const hasLogoutButton = await page
      .getByRole('link', { name: 'Logout' })
      .isVisible({ timeout: 8000 }) // Reduced from 10s but still safe
      .catch(() => false);
    return hasSuccessMessage && hasLogoutButton;
  },
});

/**
 * Verifies an error message is displayed on the login page.
 * @param errorMessage - The expected error message text.
 */
export const verifyLoginError = (errorMessage: string): InteractionStep =>
  createInteraction({
    name: `Verify Login Error: ${errorMessage}`,
    preCondition: async (page: Page) => {
      // Wait for error message to appear (replaces fixed timeout)
      await page
        .getByText(errorMessage, { exact: false })
        .waitFor({ state: 'visible', timeout: 8000 }) // Reduced from 10s but still safe
        .catch(() => {});
      return true;
    },
    action: async (page: Page) => {
      return;
    },
    postCondition: async (page: Page) => {
      const url = page.url();
      const isLoginPage = url.includes('/login');
      if (!isLoginPage) return false;

      const hasErrorMessage = await page
        .getByText(errorMessage, { exact: false })
        .isVisible({ timeout: 3000 }) // Reduced from 5s - error should be immediate
        .catch(() => false);
      return hasErrorMessage;
    },
  });
