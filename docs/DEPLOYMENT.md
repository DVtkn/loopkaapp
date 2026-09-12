# Инструкция для ИИ-агента развертывания Loop в Public Launch (12 часов)

Это подробная спецификация для автоматического или полуавтоматического развертывания приложения **Loop** на любой сервер / хостинг (Vercel, Render, Railway, Cloud Run, VPS / Docker).

---

## 1. Структура проекта и стек

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Motion + Lucide Icons + PWA
- **Backend**: Node.js + Express + Google GenAI SDK (`@google/genai`)
- **PWA & Web Push**: `manifest.json` (Standalone), `public/sw.js` (Service Worker с обработчиком `push` и `notificationclick`), Web Push API (iOS 16.4+ Safari PWA & Android Chrome)
- **Психологический движок**: `src/utils/psychologyEngine.ts` (Готтман, ЭФТ, Чепмен, Боулби ECR-R, Стернберг)

---

## 2. Переменные окружения (`.env`)

Создайте файл `.env` на основе `.env.example`:

```env
# 1. API ключ Gemini AI (для ИИ-психолога "Сова" и генерации глубоких отчётов)
# Получить бесплатно: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy..."

# 2. VAPID ключи для Web Push уведомлений (iOS Safari & Android)
# Сгенерировать командой: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY="BEl62iEWg..."
VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY"
VAPID_SUBJECT="mailto:support@loopapp.io"

# 3. URL развернутого приложения
APP_URL="https://your-loop-app.domain.com"
NODE_ENV="production"
PORT=3000
```

---

## 3. Команды для сборки и запуска

### Локальная разработка:
```bash
npm install
npm run dev
```

### Продакшн сборка:
```bash
npm run build
npm start
```
*Команда `npm run build` компилирует статические файлы в `/dist` и бандлит сервер в `dist/server.cjs` через esbuild.*

---

## 4. Как работают Web Push Уведомления на iPhone (iOS Safari)

1. **Требование Apple**: Начиная с iOS 16.4+, пуши работают для PWA, добавленных пользователем на экран «Домой».
2. **Шаги пользователя на iPhone**:
   - Открыть сайт в Safari
   - Нажать кнопку **«Поделиться»** (квадрат со стрелкой вверх)
   - Выбрать **«На экран „Домой“»**
   - Открыть Loop с экрана телефона
   - В разделе «Профиль» нажать **«Разрешить Push»**
3. В приложении уже встроен `IOSInstallPrompt.tsx` и `pushManager.ts`, автоматически подсказывающий пользователю эти шаги.

---

## 5. Эндпоинты Backend API

- `GET /api/health` — проверка статуса сервера и наличия API-ключа.
- `POST /api/ai/chat` — стриминг/ответ ИИ-психолога "Сова" с системным промптом семейной психотерапии.
- `POST /api/ai/generate-report` — генерация глубокого отчёта совместимости и синергии пары.
- `POST /api/ai/date-idea` — генерация персонализированных планов свиданий.
- `POST /api/push/subscribe` — сохранение Web Push подписки клиента.
- `POST /api/push/send-test` — отправка тестового уведомления на устройство.
