import { Page, expect } from '@playwright/test';

/**
 * Discriminated Union for functional error handling.
 * Avoids try/catch pollution in business logic.
 */
export type Result<T = void> = 
  | { success: true; value: T } 
  | { success: false; error: string };

/**
 * Represents an atomic, pure interaction with the browser.
 * @property name - Descriptive identifier for logs/debugging.
 * @property preCondition - Guard: Ensures page is ready for action.
 * @property action - The mutation/interaction (click, fill, fetch).
 * @property postCondition - Verification: Asserts state transition occurred.
 */
export interface InteractionStep {
  readonly name: string;
  readonly preCondition: (page: Page) => Promise<boolean>;
  readonly action: (page: Page) => Promise<void>;
  readonly postCondition: (page: Page) => Promise<boolean>;
}

/**
 * Higher-order function to create steps with type safety.
 */
export const createInteraction = (step: InteractionStep): InteractionStep => step;

/**
 * Executes a step in a strictly guarded sequence.
 * @param page - The Playwright Page fixture.
 * @param step - The InteractionStep to execute.
 * @returns Promise<Result> - Success or Failure with context.
 */
export const runStep = async (page: Page, step: InteractionStep): Promise<Result> => {
  // 1. Guard (Fail fast if UI is not ready)
  const ready = await step.preCondition(page).catch(e => {
    console.warn(`[${step.name}] Pre-condition error:`, e); 
    return false; 
  });
  
  if (!ready) {
    return { success: false, error: `[${step.name}] Pre-condition failed: UI state invalid.` };
  }

  // 2. Action (Encapsulate side-effects)
  try { 
    await step.action(page); 
  } catch (e) { 
    return { success: false, error: `[${step.name}] Action failed: ${(e as Error).message}` }; 
  }

  // 3. Verify (Assert transition)
  const success = await step.postCondition(page).catch(e => {
    console.warn(`[${step.name}] Post-condition error:`, e);
    return false;
  });

  if (!success) {
    return { success: false, error: `[${step.name}] Post-condition failed: Expected state not reached.` };
  }

  return { success: true, value: undefined };
};

