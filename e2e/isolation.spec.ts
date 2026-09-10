import { test, expect } from '@playwright/test';

test.describe('Cross-Account Parallel Sessions Isolation', () => {
  test('Dmitry completes test -> Anna tests stay uncompleted and Analytics remains in calibration mode', async ({ browser, baseURL }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const url = baseURL || 'http://localhost:3000';

    // 1. Setup mock/state in contextA for Dmitry
    await pageA.goto(url);
    await pageA.evaluate(() => {
      const dmitryUser = {
        id: 'user-dmitry',
        login: 'dmitry',
        name: 'Dmitry',
        gender: 'male',
        partnerLogin: 'anna',
      };
      localStorage.setItem('together_current_user', JSON.stringify(dmitryUser));
      localStorage.setItem('loop_auth_token', 'mock_token_dmitry');
      // Dmitry completed TEST-S1
      localStorage.setItem(
        'together_tests_dmitry',
        JSON.stringify([
          {
            id: 'TEST-S1',
            title: 'Стили привязанности',
            category: 'attachment',
            questions: [],
            isCompletedByMe: true,
            isCompletedByPartner: false,
            partner1Done: true,
            partner2Done: false,
          },
        ])
      );
    });

    // 2. Setup mock/state in contextB for Anna
    await pageB.goto(url);
    await pageB.evaluate(() => {
      const annaUser = {
        id: 'user-anna',
        login: 'anna',
        name: 'Anna',
        gender: 'female',
        partnerLogin: 'dmitry',
      };
      localStorage.setItem('together_current_user', JSON.stringify(annaUser));
      localStorage.setItem('loop_auth_token', 'mock_token_anna');
      // Anna has NOT completed TEST-S1
      localStorage.setItem(
        'together_tests_anna',
        JSON.stringify([
          {
            id: 'TEST-S1',
            title: 'Стили привязанности',
            category: 'attachment',
            questions: [],
            isCompletedByMe: false,
            isCompletedByPartner: true,
            partner1Done: true,
            partner2Done: false,
          },
        ])
      );
    });

    // Reload both to apply state
    await pageA.reload();
    await pageB.reload();

    // 3. In contextB (Anna), open tests tab
    await pageB.goto(`${url}/#tests`);
    await pageB.waitForTimeout(500);

    // Verify Anna sees action to take the test and NOT "Вы прошли"
    const annaBody = await pageB.textContent('body');
    expect(annaBody).not.toContain('Вы прошли');

    // 4. In contextB (Anna), open Analytics
    await pageB.goto(`${url}/#report`);
    await pageB.waitForTimeout(500);

    // Verify calibration / waiting message is displayed in together tab
    const reportText = await pageB.textContent('body');
    const hasWaitingIndicator =
      reportText?.includes('Ожидание') ||
      reportText?.includes('Калибровка') ||
      reportText?.includes('Ожидает') ||
      reportText?.includes('ещё не начаты') ||
      reportText?.includes('Нет данных');

    expect(hasWaitingIndicator).toBe(true);
    expect(reportText).not.toContain('Точки взаимной синергии (Резонанс ≥ 75%)');

    await contextA.close();
    await contextB.close();
  });
});
