# Mobile UI Tests

This directory contains Playwright tests for the digital business card application with a focus on mobile UI verification at 370px width.

## Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Generate new screenshots
npm run test:screenshots
```

## Screenshots

All screenshots are taken at 370px width to verify mobile-first design. Screenshots are committed to git to track UI changes over time.

### Screenshot Files

- `01-landing-page.png` - Home page for unauthenticated users
- `02-signup-page.png` - Sign up form
- `03-login-page.png` - Login form
- `04-onboarding-page.png` - Username selection page
- `05-not-found-page.png` - 404 profile not found page
- `06-mobile-responsive-check.png` - Responsive layout verification
- `07-no-overflow-check.png` - Horizontal overflow check
- `08-my-card-redirect-to-login.png` - Protected route redirect
- `09-text-readability-check.png` - Text size and readability
- `10-touch-target-check.png` - Button size verification

## Test Coverage

### Pages Tested
- ✅ Landing page
- ✅ Sign up page
- ✅ Login page
- ✅ Onboarding page
- ✅ Not found (404) page
- ✅ Protected route redirects

### UI Checks
- ✅ Mobile viewport (370px width)
- ✅ No horizontal overflow
- ✅ Text readability (font size >= 14px)
- ✅ Touch target size (>= 40px height)
- ✅ Responsive button stacking
- ✅ Visual regression via screenshots

## CI/CD Integration

These tests can be run in CI/CD pipelines to catch UI regressions:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm run test

- name: Upload screenshots
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: screenshots
    path: tests/screenshots/
```

## Notes

- Tests run against `http://localhost:3000` by default
- The dev server is automatically started before tests
- Screenshots are deterministic and can be used for visual regression testing
- All tests verify basic accessibility requirements (readable text, adequate touch targets)

