import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Find partner card selector', async ({ page }) => {
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
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  
  // Find all sections
  const sections = await page.locator('section').all();
  console.log('Sections count:', sections.length);
  
  for (let i = 0; i < sections.length; i++) {
    const el = sections[i];
    const text = await el.textContent();
    const className = await el.evaluate(el => el.className);
    if (text && (text.includes('Anna') || text.includes('Была') || text.includes('Настроение'))) {
      console.log(`Section ${i}: class="${className}", text="${text?.substring(0, 200)}"`);
    }
  }
});