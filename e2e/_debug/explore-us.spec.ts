import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Explore Us/Profile pages', async ({ page }) => {
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
  await page.waitForLoadState('networkidle');
  
  // Click "Мы" (Us) tab
  await page.click('text=Мы');
  await page.waitForTimeout(3000);
  
  const allText = await page.locator('body').innerText();
  console.log('=== US PAGE TEXT ===');
  console.log(allText.substring(0, 5000));
  
  // Check for analytics/radar
  const analyticsElements = await page.locator('text=Аналитика, text=Analytics, text=Радар, text=Radar, text=Радар, text=Карта').all();
  console.log('Analytics elements found:', analyticsElements.length);
  for (const el of analyticsElements) {
    console.log('ANALYTICS EL:', await el.textContent());
  }
  
  // Check all buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && (text.includes('Аналитика') || text.includes('Радар') || text.includes('Radar') || text.includes('Карта'))) {
      console.log('ANALYTICS BUTTON:', text.trim());
    }
  }
});