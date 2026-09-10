import { db, isSqlConfigured } from './db/client.ts';
import { chatMessages } from './db/schema.ts';
import { logger } from './logger.ts';
import { readEmergencyFile, writeEmergencyFile } from './services/storageService.ts';
import crypto from 'crypto';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'thinkingmachines/inkling-small:free';

export async function callGroqChat(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    logger.warn('OPENROUTER_API_KEY не задан в окружении (.env)');
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://loopkaapp.vercel.app',
        'X-Title': 'Loop Couples App',
      },
      body: JSON.stringify({
        messages,
        model: MODEL_NAME,
        temperature: 0.5,
        max_tokens: 650,
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        logger.info(`Ответ OpenRouter успешно получен (модель: ${MODEL_NAME})`);
        return content;
      }
    }

    const errText = await response.text();
    logger.warn(`OpenRouter ${MODEL_NAME} статус ${response.status}: ${errText.slice(0, 200)}`);
  } catch (err: unknown) {
    logger.error(`Сетевая ошибка при запросе к OpenRouter (${MODEL_NAME})`, err);
  }

  return null;
}

export async function saveAIMessageToDb(
  userLogin: string | undefined,
  prompt: string,
  reply: string
): Promise<void> {
  if (!userLogin) return;
  const cleanLogin = String(userLogin).toLowerCase().replace(/^@/, '');
  const now = new Date().toISOString();

  const userMsg = {
    id: crypto.randomUUID(),
    coupleId: `ai_${cleanLogin}`,
    senderLogin: cleanLogin,
    role: 'partner1',
    content: prompt,
    isRead: true,
    createdAt: now,
  };

  const aiMsg = {
    id: crypto.randomUUID(),
    coupleId: `ai_${cleanLogin}`,
    senderLogin: 'ai_owl',
    role: 'ai',
    content: reply,
    isRead: true,
    createdAt: new Date(Date.now() + 100).toISOString(),
  };

  if (isSqlConfigured() && db) {
    try {
      await db.insert(chatMessages).values([userMsg, aiMsg]);
      return;
    } catch (err: unknown) {
      logger.error('Сбой сохранения ИИ-сообщений в PostgreSQL', err, { login: cleanLogin });
    }
  }

  const store = readEmergencyFile();
  if (!store.chatMessages) store.chatMessages = [];
  store.chatMessages.push(userMsg, aiMsg);
  writeEmergencyFile(store);
}
