import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Test Anna login', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  await page.click('text=Вход');
  await page.waitForTimeout(1000);
  
  const inputs = await page.locator('input').all();
  if (inputs.length >= 2) {
    await inputs[0].fill('Anna');
    await inputs[1].fill('TestPass');
  }
  
  await page.click('text=Войти в аккаунт');
  await page.waitForTimeout(5000);
  
  const allText = await page.locator('body').innerText();
  console.log('=== ANNA LOGIN RESULT ===');
  console.log(allText.substring(0, 3000));
  
  await page.screenshot({ path: 'anna-login.png', fullPage: true });
});