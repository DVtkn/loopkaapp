import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Debug login and dashboard', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  await page.click('text=Вход');
  await page.waitForTimeout(1000);
  
  const inputs = await page.locator('input').all();
  if (inputs.length >= 2) {
    await inputs[0].fill('Dmitry');
    await inputs[1].fill('Qazwsx');
  }
  
  await page.click('text=Войти в аккаунт');
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  
  // Check full page text
  const allText = await page.locator('body').innerText();
  console.log('=== FULL PAGE TEXT AFTER LOGIN ===');
  console.log(allText);
  
  // Check all buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim()) console.log('BUTTON:', text.trim());
  }
  
  await page.screenshot({ path: 'debug-login.png', fullPage: true });
});