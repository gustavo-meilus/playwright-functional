import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runStep } from './fp-utils';
import { createLoginMachine } from './login-machine';
import {
  clickLogin,
  fillPassword,
  fillUsername,
  navigateToLogin,
  verifyLoginError,
  verifySecurePage,
} from './login-steps';

/**
 * Test data interface matching the JSON structure.
 */
interface TestCase {
  id: string;
  name: string;
  username: string;
  password: string;
  expectedState: 'securePage' | 'loginPageWithError';
  expectedMessage: string | null;
  expectedError: string | null;
}

/**
 * Loads test data from JSON file.
 * @returns Array of test cases.
 */
function loadTestData(): TestCase[] {
  const testDataPath = join(__dirname, 'test-data', 'login-test-data.json');
  const fileContent = readFileSync(testDataPath, 'utf-8');
  const data = JSON.parse(fileContent);
  return data.testCases;
}

/**
 * Executes a login test path based on test case data.
 * @param page - The Playwright Page fixture.
 * @param testCase - The test case data.
 */
async function executeLoginPath(page: Page, testCase: TestCase) {
  const navigateResult = await runStep(page, navigateToLogin);
  expect(navigateResult.success).toBe(true);

  const fillUserResult = await runStep(page, fillUsername(testCase.username));
  expect(fillUserResult.success).toBe(true);

  const fillPassResult = await runStep(page, fillPassword(testCase.password));
  expect(fillPassResult.success).toBe(true);

  const clickResult = await runStep(page, clickLogin);
  expect(clickResult.success).toBe(true);

  if (testCase.expectedState === 'securePage') {
    const verifyResult = await runStep(page, verifySecurePage);
    expect(verifyResult.success).toBe(true);
    if (testCase.expectedMessage) {
      const messageVisible = await page
        .getByText(testCase.expectedMessage)
        .isVisible()
        .catch(() => false);
      expect(messageVisible).toBe(true);
    }
  } else if (testCase.expectedState === 'loginPageWithError') {
    if (testCase.expectedError) {
      const verifyResult = await runStep(
        page,
        verifyLoginError(testCase.expectedError),
      );
      expect(verifyResult.success).toBe(true);
    }
  }
}

test.describe('Login Model-Based Tests with HAR Mocking', () => {
  /**
   * Record HAR file on first run, then use it for subsequent runs.
   * Set UPDATE_SNAPSHOT=true to re-record the HAR file.
   */
  test.beforeEach(async ({ page, context }) => {
    const harPath = join(__dirname, 'har', 'login.har');
    const updateHar = process.env.UPDATE_SNAPSHOT === 'true';
    const { existsSync } = await import('fs');

    if (updateHar || existsSync(harPath)) {
      try {
        if (updateHar) {
          // Record mode: Capture network traffic
          await context.routeFromHAR(harPath, {
            update: true,
            updateContent: 'embed',
            updateMode: 'minimal',
          });
        } else {
          // Replay mode: Use recorded HAR file for mocking
          await context.routeFromHAR(harPath, {
            notFound: 'fallback', // Fallback to network if HAR entry not found
          });
        }
      } catch (error) {
        // HAR file doesn't exist or is invalid, continue without mocking
        console.warn('HAR file not available, using live network:', error);
      }
    }
  });

  /**
   * Data-driven test: Runs all test cases from JSON file.
   */
  const testCases = loadTestData();

  for (const testCase of testCases) {
    test(`${testCase.id}: ${testCase.name}`, async ({ page }) => {
      const machine = createLoginMachine(page);
      expect(machine).toBeDefined();

      await executeLoginPath(page, testCase);
    });
  }
});

