import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Test registration flow', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Click registration
  await page.click('text=Регистрация');
  await page.waitForTimeout(1000);
  
  // Check what's on the page
  const allText = await page.locator('body').innerText();
  console.log('=== REGISTRATION PAGE ===');
  console.log(allText);
  
  // Check all buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim()) console.log('BUTTON:', text.trim());
  }
  
  // Check all inputs
  const inputs = await page.locator('input').all();
  console.log('Inputs count:', inputs.length);
  
  // Take screenshot
  await page.screenshot({ path: 'registration-page.png', fullPage: true });
});