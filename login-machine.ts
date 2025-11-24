import { createMachine, assign } from 'xstate';
import type { Page } from '@playwright/test';

/**
 * Context for the login state machine.
 */
interface LoginContext {
  page: Page | null;
  username: string;
  password: string;
  errorMessage?: string;
}

/**
 * Events that trigger state transitions.
 */
type LoginEvent =
  | { type: 'NAVIGATE_TO_LOGIN' }
  | { type: 'SUBMIT_VALID_CREDENTIALS'; username: string; password: string }
  | { type: 'SUBMIT_INVALID_USERNAME'; username: string; password: string }
  | { type: 'SUBMIT_INVALID_PASSWORD'; username: string; password: string };

/**
 * Creates a thread-safe login state machine definition.
 * Each test worker gets its own machine instance via factory pattern.
 * @param page - The Playwright Page fixture (injected at runtime).
 * @returns The configured state machine.
 */
export const createLoginMachine = (page: Page) => {
  return createMachine<LoginContext, LoginEvent>(
    {
      id: 'loginMachine',
      initial: 'initial',
      context: {
        page,
        username: '',
        password: '',
      },
      states: {
        initial: {
          on: {
            NAVIGATE_TO_LOGIN: {
              target: 'loginPage',
            },
          },
        },
        loginPage: {
          on: {
            SUBMIT_VALID_CREDENTIALS: {
              target: 'securePage',
              actions: assign({
                username: (_, event) => event.username,
                password: (_, event) => event.password,
              }),
            },
            SUBMIT_INVALID_USERNAME: {
              target: 'loginPageWithError',
              actions: assign({
                username: (_, event) => event.username,
                password: (_, event) => event.password,
                errorMessage: () => 'Invalid username.',
              }),
            },
            SUBMIT_INVALID_PASSWORD: {
              target: 'loginPageWithError',
              actions: assign({
                username: (_, event) => event.username,
                password: (_, event) => event.password,
                errorMessage: () => 'Invalid password.',
              }),
            },
          },
        },
        securePage: {
          type: 'final',
        },
        loginPageWithError: {
          type: 'final',
        },
      },
    },
  );
};

export type LoginMachine = ReturnType<typeof createLoginMachine>;

