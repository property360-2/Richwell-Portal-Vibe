# End-to-end dashboard tests

This directory contains the Playwright test suite that exercises the Richwell Portal dashboards across mobile, tablet, and desktop breakpoints. The suite stubs authentication and analytics traffic so the dashboards can render without a running backend.

## Running locally

```bash
npm install
npm run test:e2e # executes the suite using the ephemeral Playwright runner
```

To refresh the visual baselines after making intentional UI changes, execute:

```bash
npm run test:e2e:update
```

The command above will regenerate the snapshots inside `tests/e2e/__screenshots__`.

## Test data

The fixtures baked into `tests/e2e/dashboard.spec.ts` represent a healthy set of analytics responses for each role. Update them together with any UI adjustments to keep the expectations aligned with the visual layout.
