import { test, expect } from '@playwright/test';

const BASE_URL = 'https://loopkaapp.vercel.app';

test('Find Anna element', async ({ page }) => {
  await page.goto('https://loopkaapp.vercel.app');
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
  
  // Find all elements containing "Anna"
  const annaElements = await page.locator('*:has-text("Anna")').all();
  console.log('Anna elements count:', annaElements.length);
  
  for (let i = 0; i < annaElements.length; i++) {
    const el = annaElements[i];
    const text = await el.textContent();
    const tagName = await el.evaluate(el => el.tagName);
    const className = await el.evaluate(el => el.className);
    console.log(`Anna element ${i}: tag=${tagName}, class=${className}, text="${text?.substring(0, 100)}"`);
  }
  
  // Also check for partner card elements
  const partnerCards = await page.locator('[class*="partner"], [class*="Partner"], [data-testid*="partner"]').all();
  console.log('Partner cards:', partnerCards.length);
  for (const card of partnerCards) {
    const text = await card.textContent();
    console.log('PARTNER CARD:', text?.substring(0, 200));
  }
});