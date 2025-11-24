import { createMachine, assign } from 'xstate';
import type { Page } from '@playwright/test';

/**
 * Context for the registration state machine.
 */
interface RegisterContext {
  page: Page | null;
  username: string;
  password: string;
  confirmPassword: string;
  errorMessage?: string;
}

/**
 * Events that trigger state transitions.
 */
type RegisterEvent =
  | { type: 'NAVIGATE_TO_REGISTER' }
  | {
      type: 'SUBMIT_VALID_REGISTRATION';
      username: string;
      password: string;
      confirmPassword: string;
    }
  | {
      type: 'SUBMIT_MISSING_USERNAME';
      username: string;
      password: string;
      confirmPassword: string;
    }
  | {
      type: 'SUBMIT_MISSING_PASSWORD';
      username: string;
      password: string;
      confirmPassword: string;
    }
  | {
      type: 'SUBMIT_NON_MATCHING_PASSWORDS';
      username: string;
      password: string;
      confirmPassword: string;
    };

/**
 * Creates a thread-safe registration state machine definition.
 * Each test worker gets its own machine instance via factory pattern.
 * @param page - The Playwright Page fixture (injected at runtime).
 * @returns The configured state machine.
 */
export const createRegisterMachine = (page: Page) => {
  return createMachine<RegisterContext, RegisterEvent>({
    id: 'registerMachine',
    initial: 'initial',
    context: {
      page,
      username: '',
      password: '',
      confirmPassword: '',
    },
    states: {
      initial: {
        on: {
          NAVIGATE_TO_REGISTER: {
            target: 'registerPage',
          },
        },
      },
      registerPage: {
        on: {
          SUBMIT_VALID_REGISTRATION: {
            target: 'loginPage',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
            }),
          },
          SUBMIT_MISSING_USERNAME: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'All fields are required.',
            }),
          },
          SUBMIT_MISSING_PASSWORD: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'All fields are required.',
            }),
          },
          SUBMIT_NON_MATCHING_PASSWORDS: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'Passwords do not match.',
            }),
          },
        },
      },
      loginPage: {
        type: 'final',
      },
      registerPageWithError: {
        type: 'final',
      },
    },
  });
};

export type RegisterMachine = ReturnType<typeof createRegisterMachine>;
