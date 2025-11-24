# 🎭 Playwright Functional Testing POC

[![npm version](https://img.shields.io/npm/v/@playwright/test.svg)](https://www.npmjs.com/package/@playwright/test)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![XState](https://img.shields.io/badge/XState-4.38-purple.svg)](https://xstate.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Playwright](https://img.shields.io/badge/Playwright-1.44-green.svg)](https://playwright.dev)

> **Note**: This is a Proof of Concept project. Update repository URLs in `package.json` before publishing to your GitHub repository.

## 📋 Overview

**Proof of Concept** demonstrating a modern approach to UI testing that combines:

- **[Playwright](https://playwright.dev)** - Reliable end-to-end testing framework
- **[XState](https://xstate.js.org)** - Model-Based Testing with Finite State Machines
- **Functional Programming** - Pure, atomic, composable test steps
- **HAR File Mocking** - Network traffic recording/replay for test isolation
- **Data-Driven Testing** - JSON-based test case definitions

This POC showcases how to build **maintainable**, **scalable**, and **reliable** test suites using architectural patterns that promote code reusability, thread safety, and test stability.

## 🎯 Key Features

### ✨ Resilient • No Flaky Tests

**Atomic Interaction Steps**. Each test action is broken down into pure, atomic functions with explicit pre-conditions, actions, and post-conditions. This eliminates ambiguity and ensures reliable test execution.

**Event-Based Waits**. No `waitForTimeout` - all waits are based on actual page events (navigation, element visibility, network requests). This eliminates timing-related flakiness.

**HAR File Isolation**. Network traffic is recorded and replayed, ensuring tests are isolated from external service changes and run consistently offline.

### 🏗️ Architecture • Clean Separation

**Functional Core**. Pure `InteractionStep` functions follow the Guard → Action → Verification pattern, making tests predictable and testable.

**State Machine Orchestration**. XState Finite State Machines model the application's logical states, enabling systematic test path generation and coverage analysis.

**Thread-Safe Design**. Factory pattern ensures each test worker gets its own state machine instance, enabling safe parallel execution.

### 📊 Model-Based Testing

**Systematic Coverage**. State machines define all possible states and transitions, ensuring comprehensive test coverage.

**Path Generation**. XState graph algorithms can generate test paths automatically, reducing manual test case creation.

**Visual State Models**. State machines serve as living documentation of the application's behavior.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-functional

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Run all tests (uses HAR files for network mocking)
npm test

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Re-record HAR files
npm run test:record
```

## 📖 Examples

### Example 1: Atomic Interaction Step

Each test action is an atomic, pure function:

```typescript
import { Page } from '@playwright/test';
import { createInteraction, InteractionStep } from './fp-utils';

export const fillUsername = (username: string): InteractionStep =>
  createInteraction({
    name: `Fill Username: ${username}`,
    preCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      return await field.isVisible({ timeout: 10000 }).catch(() => false);
    },
    action: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      await field.clear();
      await field.fill(username);
    },
    postCondition: async (page: Page) => {
      const field = page.getByRole('textbox', { name: 'Username' });
      const value = await field.inputValue({ timeout: 5000 }).catch(() => '');
      return value === username;
    },
  });
```

### Example 2: State Machine Definition

XState models the application's logical states:

```typescript
import { createMachine, assign } from 'xstate';
import type { Page } from '@playwright/test';

export const createLoginMachine = (page: Page) => {
  return createMachine<LoginContext, LoginEvent>({
    id: 'loginMachine',
    initial: 'initial',
    states: {
      initial: {
        on: { NAVIGATE_TO_LOGIN: { target: 'loginPage' } },
      },
      loginPage: {
        on: {
          SUBMIT_VALID_CREDENTIALS: { target: 'securePage' },
          SUBMIT_INVALID_USERNAME: { target: 'loginPageWithError' },
          SUBMIT_INVALID_PASSWORD: { target: 'loginPageWithError' },
        },
      },
      securePage: { type: 'final' },
      loginPageWithError: { type: 'final' },
    },
  });
};
```

### Example 3: Data-Driven Test Execution

Tests are generated from JSON data:

```typescript
import { test, expect } from '@playwright/test';
import { runStep } from './fp-utils';
import {
  navigateToLogin,
  fillUsername,
  fillPassword,
  clickLogin,
} from './login-steps';

const testCases = loadTestData(); // Load from JSON

for (const testCase of testCases) {
  test(`${testCase.id}: ${testCase.name}`, async ({ page }) => {
    await runStep(page, navigateToLogin);
    await runStep(page, fillUsername(testCase.username));
    await runStep(page, fillPassword(testCase.password));
    await runStep(page, clickLogin);
    // Verification based on expectedState
  });
}
```

### Example 4: HAR File Mocking

Network traffic is recorded and replayed:

```typescript
test.beforeEach(async ({ page, context }) => {
  const harPath = join(__dirname, 'har', 'login.har');
  const updateHar = process.env.UPDATE_SNAPSHOT === 'true';

  if (updateHar) {
    // Record mode: Capture network traffic
    await context.routeFromHAR(harPath, {
      update: true,
      updateContent: 'embed',
      updateMode: 'minimal',
    });
  } else {
    // Replay mode: Use recorded HAR file
    await context.routeFromHAR(harPath, {
      notFound: 'fallback',
    });
  }
});
```

## 🏛️ Architecture

### Core Principles

1. **Functional Programming**
   - Pure functions with no side effects
   - Immutable data structures
   - Higher-order functions for composition
   - Discriminated unions for error handling

2. **Model-Based Testing**
   - Finite State Machines define application states
   - Systematic test path generation
   - Visual state models as documentation

3. **Atomic Interactions**
   - Each `InteractionStep` is atomic and reusable
   - Explicit pre-conditions (guards)
   - Clear actions (mutations)
   - Verifiable post-conditions

4. **User-Facing Locators**
   - Prioritize accessibility (`getByRole`, `getByLabel`)
   - Resilient to DOM changes
   - Better test maintainability

### Project Structure

```
playwright-functional/
├── fp-utils.ts              # Core functional utilities
├── login-steps.ts           # Atomic login interaction steps
├── login-machine.ts         # Login state machine (XState)
├── login.spec.ts            # Login test suite
├── register-steps.ts        # Atomic registration steps
├── register-machine.ts      # Registration state machine
├── register.spec.ts         # Registration test suite
├── test-data/               # JSON test case definitions
│   ├── login-test-data.json
│   └── register-test-data.json
├── scripts/
│   └── record-har.ts        # HAR file recording script
├── har/                     # Recorded network traffic (gitignored)
│   ├── login.har
│   └── register.har
└── playwright.config.ts     # Playwright configuration
```

## 📚 Concepts

### InteractionStep Pattern

Every test action follows this pattern:

```typescript
interface InteractionStep {
  readonly name: string;
  readonly preCondition: (page: Page) => Promise<boolean>; // Guard
  readonly action: (page: Page) => Promise<void>; // Mutation
  readonly postCondition: (page: Page) => Promise<boolean>; // Verification
}
```

**Benefits:**

- Explicit pre-conditions prevent actions on invalid states
- Clear separation of concerns
- Easy to test and debug
- Composable and reusable

### State Machine Benefits

**Systematic Coverage**: All states and transitions are explicitly defined, ensuring no paths are missed.

**Path Generation**: XState can automatically generate test paths covering all transitions.

**Living Documentation**: State machines serve as visual documentation of application behavior.

**Thread Safety**: Factory pattern ensures each test worker has isolated state.

### HAR File Strategy

**Why HAR Files?**

- Faster execution (no network latency)
- Test isolation (independent of external services)
- Consistent results (same responses every time)
- Offline testing capability

**Critical Prerequisite**: Tests MUST pass without HAR files first. HAR mocking is an optimization, not a requirement for correctness.

## 🧪 Test Cases

### Login Tests

1. **TC1: Successful Login** - Valid credentials → Secure page
2. **TC2: Invalid Username** - Wrong username → Error message
3. **TC3: Invalid Password** - Wrong password → Error message

### Registration Tests

1. **TC1: Successful Registration** - Valid data → Login page redirect
2. **TC2: Missing Username** - Empty username → Validation error
3. **TC3: Missing Password** - Empty password → Validation error
4. **TC4: Non-matching Passwords** - Mismatched passwords → Validation error

All test cases are defined in JSON files under `test-data/` and automatically executed.

## 🛠️ Development

### Adding New Test Cases

1. Add test case data to the appropriate JSON file in `test-data/`
2. Ensure corresponding `InteractionStep` objects exist
3. Update state machine if new states/transitions are needed
4. Run tests to verify

### Adding New Features

1. Create atomic `InteractionStep` objects in `*-steps.ts`
2. Define state machine in `*-machine.ts`
3. Create test suite in `*.spec.ts`
4. Add test data in `test-data/*.json`
5. Record HAR file for the new feature

### Code Standards

This project follows strict coding standards:

- ✅ **No `any` types** - Strict TypeScript typing
- ✅ **User-facing locators only** - `getByRole`, `getByLabel`, `getByText`
- ✅ **No `waitForTimeout`** - Event-based waits only
- ✅ **Pure functions** - No side effects in business logic
- ✅ **JSDoc documentation** - All functions documented

See `AGENT_INSTRUCTIONS.md` for complete standards.

## 📊 Performance

- **Test Execution**: ~40 seconds for 7 tests
- **HAR Replay**: Faster than live network calls
- **Parallel Execution**: Thread-safe design enables parallel runs
- **Stability**: 100% pass rate across multiple runs

See `PERFORMANCE.md` for detailed metrics.

## 🔍 Debugging

### View Test Execution

```bash
# Run with UI mode for visual debugging
npm run test:ui

# Run in debug mode with Playwright Inspector
npm run test:debug
```

### View Test Reports

```bash
# Open HTML report after test run
npx playwright show-report
```

### Trace Files

Traces are automatically captured on first retry. View them in the HTML report.

## 📖 Documentation

- **[AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md)** - Complete development standards and best practices
- **[CODE_REVIEW.md](./CODE_REVIEW.md)** - Code review findings and compliance checklist
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance metrics and optimizations

## 🤝 Contributing

This is a Proof of Concept project. Contributions and feedback are welcome!

### Development Workflow

1. Follow the standards in `AGENT_INSTRUCTIONS.md`
2. Ensure all tests pass
3. Run code review checklist (Step 9 in AGENT_INSTRUCTIONS.md)
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

This Proof of Concept project is built upon excellent open-source tools and services:

### 🎭 [Playwright](https://playwright.dev)

Thank you to the **Playwright team at Microsoft** for creating an outstanding end-to-end testing framework. Playwright's auto-waiting, web-first assertions, and cross-browser support make it the foundation of this POC. The framework's reliability, performance, and developer experience have been instrumental in demonstrating these architectural patterns.

**Resources:**

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Playwright Discord](https://aka.ms/playwright/discord)

### 🔄 [XState](https://xstate.js.org)

Thank you to **David Khourshid** and the **XState community** for building a powerful state machine library. XState enables Model-Based Testing by providing a robust way to define, visualize, and test application state machines. The library's TypeScript support and factory pattern capabilities make it perfect for thread-safe test automation.

**Resources:**

- [XState Documentation](https://xstate.js.org/docs/)
- [XState GitHub](https://github.com/statelyai/xstate)
- [XState Visualizer](https://stately.ai/viz)

### 🧪 [Practice Expand Testing](https://practice.expandtesting.com)

Thank you to **Expand Testing** for providing a free, comprehensive testing practice platform. The [practice.expandtesting.com](https://practice.expandtesting.com) website offers real-world testing scenarios including login, registration, and various UI components that are perfect for demonstrating testing patterns. This POC uses their login and registration pages as examples.

**Resources:**

- [Practice Expand Testing](https://practice.expandtesting.com)
- [Expand Testing Main Site](https://expandtesting.com)

---

**Special Thanks:**

- The open-source community for continuous innovation in testing tools
- All contributors to Playwright, XState, and related projects
- The testing community for sharing knowledge and best practices

## 🔗 References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright HAR API](https://playwright.dev/docs/network#record-http-activity)
- [XState Documentation](https://xstate.js.org/docs/)
- [Functional Programming in TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html)

---

**Note**: This is a Proof of Concept demonstrating architectural patterns for UI testing. It is not production-ready but serves as a reference implementation for building maintainable test suites.
