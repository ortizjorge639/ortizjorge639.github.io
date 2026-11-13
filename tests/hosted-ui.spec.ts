import { test, expect } from '@playwright/test';

// Explicit fixture origin: every request is intercepted, never a real provider.
const api='https://portfolio-fixture.azurewebsites.net';
for(const path of ['/', '/read/just-play/']) {
  for(const failure of ['outage','malformed','disabled','network']) {
    test(`configured public guide ${failure} stays truthful at ${path}`,async({page})=>{
      await page.route(`${api}/**`,route=>failure==='network'?route.abort():route.fulfill({status:failure==='outage'?503:200,body:failure==='malformed'?'{':JSON.stringify({available:false}),contentType:'application/json'}));
      await page.goto(path);
      await page.locator('#frog-trigger').click();
      await expect(page.locator('#guide-feedback-text')).toContainText('Live answers are temporarily unavailable');
      await expect(page.locator('#guide-panel')).not.toContainText(/local Copilot|dev:guide|local bridge|local CLI/i);
      await expect(page.locator('#guide-send')).toBeDisabled();
      await expect(page.getByRole('link',{name:'Browse public project notes',exact:true})).toHaveAttribute('href','/read/');
    });
  }
  test(`configured public guide malformed answer has hosted recovery at ${path}`,async({page})=>{
    await page.route(`${api}/api/guide/status`,route=>route.fulfill({json:{available:true,mode:'model-api',provider:'azure-openai'}}));
    await page.route(`${api}/api/guide/chat`,route=>route.fulfill({body:'{',contentType:'application/json'}));
    await page.goto(path);await page.locator('#frog-trigger').click();
    await expect(page.locator('#guide-send')).toBeEnabled();
    await page.locator('.guide-privacy summary').click();
    await expect(page.locator('#guide-privacy')).toContainText('Do not send sensitive information');
    await page.locator('#guide-question').fill('What is Just Play?');await page.locator('#guide-send').click();
    await expect(page.locator('#guide-feedback-text')).toContainText('Live answers are temporarily unavailable');
    await expect(page.locator('#guide-panel')).not.toContainText(/local Copilot|dev:guide|local bridge|local CLI/i);
  });
}
