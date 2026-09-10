import { test, expect } from '@playwright/test';

test('Login as Dmitry', async ({ page }) => {
  await page.goto('https://loopkaapp.vercel.app');
  await expect(page).toHaveTitle(/Loop/);
  
  // Click login button
  await page.click('text=Вход');
  await page.waitForTimeout(1000);
  
  // Wait for inputs to appear
  await page.waitForSelector('input', { state: 'visible', timeout: 5000 });
  
  // Find all inputs and fill the first one with login, second with password
  const inputs = await page.locator('input').all();
  console.log('Number of inputs:', inputs.length);
  
  if (inputs.length >= 2) {
    // First input = login, second = password
    await inputs[0].fill('Dmitry');
    await inputs[1].fill('Qazwsx');
  } else if (inputs.length === 1) {
    await inputs[0].fill('Dmitry');
  }
  
  // Try to find and click submit button
  const buttons = await page.locator('button').all();
  console.log('Number of buttons:', buttons.length);
  
  for (const button of buttons) {
    const text = await button.textContent();
    console.log('Button text:', text?.trim());
    if (text && (text.includes('Войти') || text.includes('Login') || text.includes('Submit'))) {
      await button.click();
      break;
    }
  }
  
  await page.waitForTimeout(2000);
  
  // Check result
  const title = page.title();
  console.log('Final title:', title);
  await page.screenshot({ path: 'login-result.png' });
  
  // Check if we're still on login page or redirected
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
});