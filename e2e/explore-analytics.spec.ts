import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Explore Analytics page tabs', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Login
  await page.click('text=Вход');
  await page.waitForTimeout(1000);
  const inputs = await page.locator('input').all();
  if (inputs.length >= 2) {
    await inputs[0].fill('Dmitry');
    await inputs[1].fill('Qazwsx');
  }
  await page.click('text=Войти в аккаунт');
  await page.waitForTimeout(3000);
  
  // Go to Us page
  await page.click('text=Мы');
  await page.waitForTimeout(2000);
  
  // Click Analytics link
  await page.click('text=Аналитика союза →');
  await page.waitForTimeout(3000);
  
  // Check for tabs using different selectors
  const togetherTab = await page.locator('text=Вместе').count();
  const partnerTab = await page.locator('text=Anna').count();
  const selfTab = await page.locator('text=Dmitry').count();
  console.log('Tabs: Вместе=', togetherTab, 'Anna=', partnerTab, 'Dmitry=', selfTab);
  
  // Click tabs to see content
  if (togetherTab > 0) {
    await page.click('text=Вместе');
    await page.waitForTimeout(1000);
  }
  
  if (partnerTab > 0) {
    await page.click('text=Anna');
    await page.waitForTimeout(1000);
  }
  
  if (selfTab > 0) {
    await page.click('text=Dmitry');
    await page.waitForTimeout(1000);
  }
  
  // Check for radar
  const radar = await page.locator('canvas, svg').all();
  console.log('Canvas/SVG elements:', radar.length);
  
  await page.screenshot({ path: 'analytics-tabs.png', fullPage: true });
});