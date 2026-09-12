import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Explore UI after login', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Click login
  await page.click('text=Вход');
  await page.waitForTimeout(1000);
  
  const inputs = await page.locator('input').all();
  if (inputs.length >= 2) {
    await inputs[0].fill('Dmitry');
    await inputs[1].fill('Qazwsx');
  }
  
  await page.click('text=Войти в аккаунт');
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  
  // Check all visible text elements
  const allText = await page.locator('body').innerText();
  console.log('=== PAGE TEXT ===');
  console.log(allText.substring(0, 5000));
  
  // Check all buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim()) console.log('BUTTON:', text.trim());
  }
  
  // Check all links
  const links = await page.locator('a').all();
  for (const link of links) {
    const text = await link.textContent();
    if (text && text.trim()) console.log('LINK:', text.trim());
  }
  
  // Take screenshot
  await page.screenshot({ path: 'dashboard-after-login.png', fullPage: true });
});