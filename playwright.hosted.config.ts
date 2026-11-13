import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'**/hosted-ui.spec.ts',workers:1,
  use:{baseURL:'http://127.0.0.1:43188',trace:'retain-on-failure'},
  webServer:{command:'npm run build && npm run preview -- --port 43188 --strictPort',url:'http://127.0.0.1:43188',timeout:120000,reuseExistingServer:false,env:{VITE_GUIDE_API:'https://portfolio-fixture.azurewebsites.net'}},
});
