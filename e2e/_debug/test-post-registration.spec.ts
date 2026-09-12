import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Test registration and post-registration flow', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Click registration
  await page.click('text=Регистрация');
  await page.waitForTimeout(1000);
  
  const inputs = await page.locator('input').all();
  if (inputs.length >= 3) {
    await inputs[0].fill('TestUser_' + Date.now());
    await inputs[1].fill('Test User');
    await inputs[2].fill('TestPass123!');
  }
  
  // Select gender
  await page.click('text=Мужской (Он)');
  
  // Submit
  await page.click('text=Создать аккаунт');
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  
  // Check what's on the page after registration
  const allText = await page.locator('body').innerText();
  console.log('=== POST REGISTRATION ===');
  console.log(allText.substring(0, 3000));
  
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
  await page.screenshot({ path: 'post-registration.png', fullPage: true });
});