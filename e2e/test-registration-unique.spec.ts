import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Test registration with unique login', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Click registration
  await page.click('text=Регистрация');
  await page.waitForTimeout(1000);
  
  // Use very unique login
  const uniqueLogin = 'TestUser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  console.log('Trying login:', uniqueLogin);
  
  const inputs = await page.locator('input').all();
  if (inputs.length >= 3) {
    await inputs[0].fill(uniqueLogin);
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
  
  // Check for error messages
  const errors = await page.locator('text=Ошибка, text=Error, text=ошибка, .error, .alert').all();
  for (const err of errors) {
    console.log('ERROR:', await err.textContent());
  }
  
  // Check all buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim()) console.log('BUTTON:', text.trim());
  }
  
  // Take screenshot
  await page.screenshot({ path: 'post-registration-unique.png', fullPage: true });
});