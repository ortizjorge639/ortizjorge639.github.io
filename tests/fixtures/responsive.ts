import { test as base } from '@playwright/test';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export { expect } from '@playwright/test';

export const test = base.extend<{}, { firefoxAppData: string | undefined }>({
  firefoxAppData: [async ({ browserName }, use) => {
    if (browserName !== 'firefox') {
      await use(undefined);
      return;
    }
    // Firefox initializes app-data storage separately from Playwright's profile.
    const root = await mkdtemp(join(tmpdir(), 'portfolio-firefox-appdata-'));
    try {
      await mkdir(join(root, 'app'));
      await mkdir(join(root, 'cache'));
      await use(root);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, { scope: 'worker' }],
  launchOptions: async ({ launchOptions, firefoxAppData }, use) => {
    await use(firefoxAppData ? {
      ...launchOptions,
      env: {
        ...process.env,
        ...launchOptions.env,
        MOZ_APP_DATA: join(firefoxAppData, 'app'),
        MOZ_LOCAL_APP_DATA: join(firefoxAppData, 'cache'),
      },
    } : launchOptions);
  },
});
