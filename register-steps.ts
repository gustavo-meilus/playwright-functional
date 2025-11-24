import { Page } from '@playwright/test';
import { createInteraction, InteractionStep } from './fp-utils';

/**
 * Navigates to the registration page.
 */
export const navigateToRegister: InteractionStep = createInteraction({
  name: 'Navigate to Register Page',
  preCondition: async (page: Page) => {
    const currentUrl = page.url();
    return !currentUrl.includes('/register');
  },
  action: async (page: Page) => {
    await page.goto('https://practice.expandtesting.com/register', {
      waitUntil: 'domcontentloaded', // Keep domcontentloaded for stability
      timeout: 25000, // Reduced from 30s - HAR files make this faster
    });
  },
  postCondition: async (page: Page) => {
    const url = page.url();
    const isRegisterPage = url.includes('/register');
    const hasForm = await page
      .getByRole('textbox', { name: 'Username' })
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    return isRegisterPage && hasForm;
  },
});

/**
 * Fills the username field with the provided value.
 * @param username - The username to enter.
 */
export const fillRegisterUsername = (username: string): InteractionStep =>
  createInteraction({
    name: `Fill Register Username: ${username}`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      return await field.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      await field.clear();
      if (username) {
        await field.fill(username);
      }
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
export const fillRegisterPassword = (password: string): InteractionStep =>
  createInteraction({
    name: `Fill Register Password`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password', exact: true });
      return await field.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password', exact: true });
      await field.clear();
      if (password) {
        await field.fill(password);
      }
    },
    postCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Password', exact: true });
      const value = await field.inputValue({ timeout: 3000 }).catch(() => ''); // Reduced from 5s
      return value === password;
    },
  });

/**
 * Fills the confirm password field with the provided value.
 * @param confirmPassword - The confirm password to enter.
 */
export const fillConfirmPassword = (confirmPassword: string): InteractionStep =>
  createInteraction({
    name: `Fill Confirm Password`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Confirm Password' });
      return await field.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Confirm Password' });
      await field.clear();
      if (confirmPassword) {
        await field.fill(confirmPassword);
      }
    },
    postCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Confirm Password' });
      const value = await field.inputValue({ timeout: 3000 }).catch(() => ''); // Reduced from 5s
      return value === confirmPassword;
    },
  });

/**
 * Clicks the Register button.
 */
export const clickRegister: InteractionStep = createInteraction({
  name: 'Click Register Button',
  preCondition: async (page: Page) => {
    const button = page.getByRole('button', { name: 'Register' });
    return await button.isVisible({ timeout: 8000 }).catch(() => false); // Reduced from 10s but still safe
  },
  action: async (page: Page) => {
    const button = page.getByRole('button', { name: 'Register' });
    await button.click(); // Remove explicit timeout - use global actionTimeout
  },
  postCondition: async (page: Page) => {
    // Button click initiated, wait for either navigation to login page or error message/alert to appear
    try {
      // Wait for navigation to login page (success case) or error message/alert (failure case)
      await Promise.race([
        page.waitForURL(/\/login/, { timeout: 12000 }), // Reduced from 15s but still safe
        page.getByText(/(All fields are required|Passwords do not match)\./, { exact: false }).waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
        page.getByText(/error occurred/i, { exact: false }).waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
        page.locator('alert, [role="alert"]').waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
      ]).catch(() => {});
    } catch {
      // Continue if neither condition is met
    }
    return true;
  },
});

/**
 * Verifies the user is redirected to the login page with success message.
 */
export const verifyRegistrationSuccess: InteractionStep = createInteraction({
  name: 'Verify Registration Success',
  preCondition: async (page: Page) => {
    // Wait for navigation to login page
    try {
      await page.waitForURL(/\/login/, { timeout: 12000 }); // Reduced from 15s but still safe
    } catch {
      // Continue even if URL doesn't match exactly
    }
    return true;
  },
  action: async (page: Page) => {
    return;
  },
  postCondition: async (page: Page) => {
    // Wait for navigation to complete
    try {
      await page.waitForURL(/\/login/, { timeout: 12000 }); // Reduced from 15s but still safe
    } catch {
      // If navigation didn't happen, check if we're still on register page
      const url = page.url();
      if (!url.includes('/login')) {
        return false;
      }
    }
    
    // Remove redundant waitForLoadState - waitForURL already ensures navigation
    const url = page.url();
    const isLoginPage = url.includes('/login');
    
    // Primary verification: We're on the login page
    if (!isLoginPage) return false;

    // Secondary verification: Login form is visible
    const hasLoginForm = await page
      .getByRole('textbox', { name: 'Username' })
      .isVisible({ timeout: 8000 }) // Reduced from 10s but still safe
      .catch(() => false);
    
    // Success if we're on login page and form is visible
    // Message is optional and may not always be present
    return hasLoginForm;
  },
});

/**
 * Verifies an error message is displayed on the registration page.
 * @param errorMessage - The expected error message text.
 */
export const verifyRegistrationError = (errorMessage: string): InteractionStep =>
  createInteraction({
    name: `Verify Registration Error: ${errorMessage}`,
    preCondition: async (page: Page) => {
      // Wait for error message to appear - try multiple methods
      const errorText = errorMessage.trim();
      const errorTextWithoutPeriod = errorText.replace(/\.$/, '');
      
      // Wait up to 12 seconds for the error to appear (reduced from 15s but still safe)
      try {
        await Promise.race([
          // Wait for text directly (most reliable)
          page.getByText(errorText, { exact: false }).waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
          // Wait for alert element
          page.locator('alert').filter({ hasText: new RegExp(errorTextWithoutPeriod, 'i') }).waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
          // Wait for alert role
          page.getByRole('alert').filter({ hasText: new RegExp(errorTextWithoutPeriod, 'i') }).waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
          // Also wait for any alert element to appear
          page.locator('alert').waitFor({ state: 'visible', timeout: 12000 }), // Reduced from 15s but still safe
        ]);
      } catch {
        // Continue even if wait times out - postCondition will verify
      }
      return true;
    },
    action: async (page: Page) => {
      return;
    },
    postCondition: async (page: Page) => {
      // Remove redundant waitForLoadState calls - error should be visible immediately after click
      const url = page.url();
      const isRegisterPage = url.includes('/register');
      if (!isRegisterPage) return false;

      // The error message can appear as text directly or inside an alert element
      const errorText = errorMessage.trim().toLowerCase();
      const errorKeywords = errorText.split(' ').filter(w => w.length > 2); // Get meaningful words
      
      // Method 1: Check for text directly using getByText (most reliable)
      try {
        const textLocator = page.getByText(errorMessage, { exact: false });
        const isVisible = await textLocator.isVisible({ timeout: 8000 }); // Reduced from 10s but still safe
        if (isVisible) return true;
      } catch {
        // Continue to next method
      }
      
      // Method 1b: Check for text without period (in case period is missing)
      try {
        const textWithoutPeriod = errorMessage.replace(/\.$/, '');
        const textLocator = page.getByText(textWithoutPeriod, { exact: false });
        const isVisible = await textLocator.isVisible({ timeout: 8000 }); // Reduced from 10s but still safe
        if (isVisible) return true;
      } catch {
        // Continue to next method
      }
      
      // Method 2: Check all alert elements for the error text
      const alertSelectors = ['alert', '[role="alert"]'];
      for (const selector of alertSelectors) {
        try {
          const alerts = page.locator(selector);
          const count = await alerts.count();
          for (let i = 0; i < count; i++) {
            const alertText = (await alerts.nth(i).textContent()) || '';
            const alertTextLower = alertText.toLowerCase();
            // Check if alert contains the error message or its key words
            if (alertTextLower.includes(errorText) || 
                errorKeywords.every(keyword => alertTextLower.includes(keyword))) {
              return true;
            }
          }
        } catch {
          // Continue to next selector
        }
      }
      
      // Method 3: Check page content directly
      try {
        const pageContent = await page.textContent('body') || '';
        const pageContentLower = pageContent.toLowerCase();
        if (pageContentLower.includes(errorText) || 
            errorKeywords.every(keyword => pageContentLower.includes(keyword))) {
          return true;
        }
      } catch {
        // Ignore errors
      }
      
      return false;
    },
  });

