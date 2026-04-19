# E2E Test Migration to BDD Paradigm with Cucumber.js

## Summary

This document describes the transformation of the end-to-end tests for the `pagopa-checkout-tests` project from the **Jest + Puppeteer** paradigm to the **BDD (Behavior-Driven Development)** paradigm based on **Cucumber.js + Gherkin + Puppeteer**.

The goal was to maintain compatibility with the existing test logic, reusing the already implemented helpers, while introducing a more readable, maintainable, and behavior-oriented structure.

---

## 1. Context: the previous situation

### Original structure

```
e2e-tests/
  src/
    auth/
      checkout.spid-auth.integration.test.ts   ← Jest test
      helpers.ts                                 ← reusable automation logic
```

### Features

| Aspect | Description |
|---|---|
| **Framework** | Jest + jest-puppeteer |
| **Test language** | Imperative TypeScript |
| **Structure** | `describe` / `beforeAll` / `beforeEach` / `it` |
| **Business readability** | Low — tests can only be understood by developers |
| **Granularity** | A single `it` block contained both login and logout |

### Original example (simplified)

```typescript
it("Should perform login and logout operation successfully", async() => {
    // #1 login
    await page.waitForSelector('#login-header button');
    await page.locator('#login-header button').click();
    if (CHECKOUT_URL.includes("uat")) await oneIdentityLogin(page);
    else await identityProviderMock(page);

    // #2 logout
    await page.evaluate(() => { /* click user menu + logout */ });
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();

    // #3 check
    const button = await page.waitForSelector('#login-header button', { visible: true });
    expect(button).not.toBeNull();
});
```

### Identified possible improvements
Below are the possible areas of improvement that a BDD approach could solve:

1. **Single Responsibility Principle**: a single test verified two distinct behaviors (login and logout);
2. **Imperative language**: the tests describe *how* to interact with the UI, not *what* is being verified from a business perspective;
3. **Readability for non-technical stakeholders**: difficulty for non-technical stakeholders in understanding the expected behavior since they lack the skills to read the code;
4. **Separation between test logic and automation logic**: the login/logout logic is now separated from the Puppeteer interaction details, making reuse and maintenance easier.

---

## 2. The transformation: followed principles

### 2.1 Separation between specification and implementation

| Layer | Responsibility | File |
|---|---|---|
| **Feature file** (Gherkin) | Describes the *what* — expected behavior in natural language | `.feature` |
| **Step definitions** | Translates Gherkin steps into Puppeteer automation | `auth.steps.ts` |
| **Support** (World, Hooks) | Manages browser lifecycle, shared context, configuration | `world.ts`, `hooks.ts` |
| **Helpers** (reused) | Low-level automation logic, unchanged | `src/auth/helpers.ts` |

### 2.2 One scenario = one behavior

The original scenario (login + logout in a single test) was split into **two independent scenarios**:

- **Scenario 1**: Verifies that login via SPID works.
- **Scenario 2**: Verifies that logout works (with login as a precondition in the `Given`).

This ensures that a failure in login does not mask a potential problem in logout, and vice versa.

### 2.3 Declarative and business-oriented language

| Before (imperative) | After (declarative) |
|---|---|
| `await page.waitForSelector('#login-header button')` | `When the user starts the login process` |
| `await page.click("#spidButton")` | `And the user authenticates with the SPID identity provider` |
| `buttons[0].click(); lis[0].click()` | `When the user requests to logout` |

### 2.4 Technical details in hooks, not in tests

Viewport, timeouts, initial navigation, and opening/closing the browser have been moved to the Cucumber **lifecycle hooks** (`BeforeAll`, `Before`, `After`, `AfterAll`), completely separating them from the behavior specification.

### 2.5 Reuse of existing logic

The `oneIdentityLogin()`, `identityProviderMock()`, and `sleep()` functions from `src/auth/helpers.ts` were **imported and reused** in the step definitions without any modification. The only necessary adaptation was making `expect` globally available (see section 4.3).

---

## 3. Added files structure

```
e2e-tests/
  cucumber.js                          ← Cucumber configuration
  features/
    auth/
      checkout-spid-auth.feature       ← Gherkin specification
    step-definitions/
      auth.steps.ts                    ← Steps implementation
    support/
      world.ts                         ← Shared context across steps
      hooks.ts                         ← Lifecycle: browser, page, cleanup
  src/
    auth/
      helpers.ts                       ← UNCHANGED — reused
```

---

## 4. Role of each component

### 4.1 `checkout-spid-auth.feature` — The specification

```gherkin
@auth @spid
Feature: Checkout SPID Authentication
  As a user of the Checkout platform
  I want to authenticate using SPID identity provider
  So that I can securely access the payment checkout

  Background:
    Given the user is on the Checkout homepage
    And the language is set to "it"

  @smoke
  Scenario: Successful login via SPID identity provider
    When the user starts the login process
    And the user authenticates with the SPID identity provider
    Then the user should be logged in successfully

  @smoke
  Scenario: Successful logout after SPID authentication
    Given the user is authenticated via SPID
    When the user requests to logout
    And the user confirms the logout
    Then the user should be logged out
    And the login button should be visible
```

**Role**: Defines *what* the system must do, in natural language that can be understood by product owners and non-technical QA.

**Tags** (`@auth`, `@spid`, `@smoke`): allow filtering test execution, e.g., `--tags "@smoke"` to run only critical tests.

**Background**: shared steps executed before each scenario (equivalent to `beforeEach`).

### 4.2 `auth.steps.ts` — The step definitions

Every sentence in the feature file is linked to a TypeScript function that executes the Puppeteer automation:

```typescript
When('the user starts the login process', async function (this: CheckoutWorld) {
    await this.page.waitForSelector('#login-header button');
    await this.page.locator('#login-header button').click();
});
```

**Role**: Bridge between natural language and automation. Imports and reuses functions from `src/auth/helpers.ts`.

**Note on environment-dependent logic**: the branching `if (url.includes('uat'))` is handled here, not in the feature file — the specification remains environment-agnostic.

### 4.3 `hooks.ts` — Lifecycle management

```typescript
// Makes expect global for compatibility with Jest helpers
(globalThis as any).expect = expect;

BeforeAll  → launches the Puppeteer browser (once per suite)
Before     → creates an incognito context + new page (for each scenario)
After      → closes page and context (cleanup)
AfterAll   → closes the browser
```

**Role**: Isolates all technical management (browser, viewport, timeouts) outside of specifications and steps.

**Note on `expect`**: existing helpers in `src/auth/helpers.ts` use `expect()`, which is global in Jest. In Cucumber, it does not exist. To maintain compatibility without modifying the helpers, we installed the standalone `expect` package (the same engine used internally by Jest) and exposed it globally.

### 4.4 `world.ts` — The shared context

```typescript
export class CheckoutWorld extends World {
    browser!: Browser;
    page!: Page;
    checkoutUrl: string;
}
```

**Role**: Shared object between all steps of a scenario. Replaces the `page` and `browser` global variables from jest-puppeteer with an explicit and typed context.

### 4.5 `cucumber.js` — The configuration

```javascript
module.exports = {
  default: {
    requireModule: ['ts-node/register'],          // enables TypeScript
    require: ['features/support/**/*.ts',          // loads hooks + world
              'features/step-definitions/**/*.ts'], // loads step definitions
    paths: ['features/**/*.feature'],              // where to find .feature files
    format: ['progress', 'html:test_reports/cucumber-report.html'],
  }
};
```

**Role**: Tells Cucumber where to find features, steps, support files, and how to generate reports.

---

## 5. Added dependencies

| Package | Version | Purpose |
|---|---|---|
| `@cucumber/cucumber` | latest | BDD Framework — Gherkin runner |
| `ts-node` | latest | Direct execution of TypeScript without compilation |
| `expect` | latest | Standalone assertions library (compatibility with Jest helpers) |
| `@types/node` | latest | TypeScript types for Node.js |

### Modified existing files

| File | Change |
|---|---|
| `package.json` | Added `test:bdd` and `test:bdd:tags` scripts |
| `tsconfig.json` | Extended `include` with `features/**/*.ts` |
| `.eslintrc.json` | Added `features/**` to `ignorePatterns` (ESLint lacks the TS parser) |

**No existing test file or helper was modified.**

---

## 6. How to run tests

```bash
# All BDD tests
npm run test:bdd

# Only @smoke scenarios
npm run test:bdd:tags "@smoke"

# Only auth scenarios
npm run test:bdd:tags "@auth"

# Exclude WIP scenarios
npm run test:bdd:tags "not @wip"

# Direct execution with dotenv
npx dotenv -e uat.env -- npx cucumber-js
```

---

## 7. Advantages of the new structure

| Aspect                        | Before (Jest) | After (Cucumber BDD) |
|-------------------------------|---|---|
| **Readability**               | Developers only | Also POs, QAs, stakeholders |
| **Granularity**               | 1 test = N behaviors | 1 scenario = 1 behavior |
| **Maintainability**           | Logic and setup mixed | Clear separation between specification, automation, and infrastructure |
| **Selective execution**       | By file/regex | By semantic tag (`@smoke`, `@auth`) |
| **Living documentation**      | Absent | `.feature` files act as always-updated specs |
| **Step reuse**                | Limited (copy/paste) | Each step is reusable in any scenario |
| **Reports**                   | JUnit XML | Navigable HTML report + progress |
| **Failure diagnosis**         | Stack trace reading | Clear which step failed in the flow |

---

## 8. Suggested next steps

1. **Transform the remaining test files** (`checkout.npg.integration.test.ts`, `psp-sorting`, `login-availability`, etc.) following the same approach;
2. **Create feature files in subfolders** `features/npg/`, `features/verify/`;
3. **Extract common steps** (e.g., navigation, language selection) into a shared `common.steps.ts` file;
4. **Integrate into CI/CD** with tag-based execution: `@smoke` on every deploy, `@regression` in nightly runs;
5. **Add screenshot on failure** in the `After` hook to facilitate debugging.
