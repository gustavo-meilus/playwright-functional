# Contributing to Playwright Functional Testing POC

Thank you for your interest in contributing to this Proof of Concept project!

## Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/playwright-functional.git
   cd playwright-functional
   ```

2. **Install Dependencies**

   ```bash
   npm install
   npx playwright install
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

## Code Standards

This project follows strict coding standards outlined in `AGENT_INSTRUCTIONS.md`. Key requirements:

### TypeScript

- ✅ **No `any` types** - Use proper types (`Page`, `InteractionStep`, etc.)
- ✅ **Explicit imports** - `import { type Page } from '@playwright/test'`
- ✅ **Strict typing** - All functions must have proper type annotations

### Locators

- ✅ **User-facing only** - Use `getByRole`, `getByLabel`, `getByText`, `getByTestId`
- ❌ **No attribute selectors** - Avoid `page.locator('input[name="..."]')`
- ✅ **Handle ambiguity** - Use `exact: true` when needed

### Wait Strategies

- ✅ **Event-based waits** - `waitForURL()`, `waitFor({ state: 'visible' })`
- ❌ **No `waitForTimeout`** - Use event-based alternatives

### Functional Programming

- ✅ **Pure functions** - No side effects in business logic
- ✅ **Atomic steps** - Each `InteractionStep` is atomic and reusable
- ✅ **Immutable data** - Use `readonly` properties

## Development Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow the standards in `AGENT_INSTRUCTIONS.md`
   - Write tests for new functionality
   - Ensure all tests pass

3. **Run Code Review Checklist**
   - Follow Step 9 in `AGENT_INSTRUCTIONS.md`
   - Run automated compliance checks:
     ```bash
     grep -r ":\s*any\b" --include="*.ts" --exclude-dir=node_modules
     grep -r "waitForTimeout" --include="*.ts" --exclude-dir=node_modules
     grep -r "\.locator\(['\"]input\[name" --include="*.ts" --exclude-dir=node_modules
     ```

4. **Commit changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## Testing

- All tests must pass before submitting PR
- Tests should be stable (run multiple times to verify)
- Add tests for new features
- Update test data JSON files as needed

## Questions?

Feel free to open an issue for questions or discussions!
