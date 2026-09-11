import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Test registration with simple password', async ({ page }) => {
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
    // Try very simple password
    await inputs[2].fill('12345678');
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
  const errors = await page.locator('.error, .alert, [role="alert"], text=Ошибка, text=error').all();
  for (const err of errors) {
    console.log('ERROR:', await err.textContent());
  }
  
  // Check all text for validation messages
  const allText2 = await page.locator('body').innerText();
  if (allText2.includes('Ошибка') || allText2.includes('error') || allText2.includes('валидац')) {
    console.log('Validation error detected in page text');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'post-registration-simple.png', fullPage: true });
});