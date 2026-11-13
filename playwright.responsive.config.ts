import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  use: { ...base.use, trace: { mode: 'retain-on-failure', screenshots: false } },
  testIgnore: [],
  testMatch: '**/responsive.spec.ts',
  projects: (['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
    name: `responsive-${browserName}`,
    use: { browserName },
  })),
});
