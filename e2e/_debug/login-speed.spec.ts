import { test } from '@playwright/test';

test('Debug: what dashboard shows after login', async ({ page }) => {
  await page.goto('https://loopkaapp.vercel.app');
  await page.waitForLoadState('networkidle');

  await page.click('text=Вход');
  await page.waitForTimeout(1500);
  const inputs = await page.locator('input').all();
  await inputs[0].fill('Dmitry');
  await inputs[1].fill('Qazwsx');

  const t0 = Date.now();
  await page.click('text=Войти в аккаунт');
  await page.waitForLoadState('networkidle');
  console.log('Login POST took', Date.now() - t0, 'ms');

  // Poll every 3s for dashboard marker
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    const hasTest = bodyText.includes('Пройти тест');
    const hasCouple = bodyText.includes('Anna & Dmitry');
    console.log(`t=${(i+1)*3}s hasTest=${hasTest} hasCouple=${hasCouple} len=${bodyText.length}`);
    if (hasTest) {
      console.log('Dashboard ready at', (i+1)*3, 'seconds');
      break;
    }
  }

  await page.screenshot({ path: 'docs/screenshots/post-login-final.png', fullPage: true });
});