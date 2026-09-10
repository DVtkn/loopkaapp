import { db, isSqlConfigured } from './db/client.ts';
import { chatMessages } from './db/schema.ts';
import { logger } from './logger.ts';
import { readEmergencyFile, writeEmergencyFile } from './services/storageService.ts';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

async function callGeminiFallback(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const formattedPrompt = messages
      .map((m) => `${m.role === 'user' ? 'Пользователь' : m.role === 'assistant' ? 'Сова' : 'Инструкция'}: ${m.content}`)
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedPrompt,
    });

    if (response.text) {
      logger.info('Ответ успешно получен через резервный Gemini API');
      return response.text;
    }
  } catch (err) {
    logger.warn('Резервный Gemini API вернул ошибку:', undefined, err);
  }
  return null;
}

export async function callGroqChat(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  if (GROQ_API_KEY) {
    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            messages,
            model,
            temperature: 0.5,
            max_tokens: 650,
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            logger.info(`Ответ Groq успешно получен (модель: ${model})`);
            return content;
          }
        }

        const errText = await response.text();
        logger.warn(`Groq ${model} статус ${response.status}: ${errText.slice(0, 200)}`);
        // При ошибке лимита (429) или недоступности пробуем следующую модель
      } catch (err: unknown) {
        logger.error(`Сетевая ошибка при запросе к Groq (${model})`, err);
      }
    }
  } else {
    logger.warn('GROQ_API_KEY не задан в окружении (.env), пробуем резервный Gemini API');
  }

  // Автоматический фоллбэк на Gemini при исчерпании лимитов Groq
  const geminiReply = await callGeminiFallback(messages);
  if (geminiReply) {
    return geminiReply;
  }

  return null;
}

export function generateSmartPsychologistReply(
  userMessage: string,
  partnerName: string,
  partner2Name: string
): string {
  const text = (userMessage || '').toLowerCase();

  if (
    text.includes('ссора') ||
    text.includes('ругаем') ||
    text.includes('обид') ||
    text.includes('конфликт') ||
    text.includes('спор')
  ) {
    return `**Взгляд психолога**: За каждым острым конфликтом и обидой всегда стоит уязвимое чувство — страх быть неуслышанным или отвергнутым. Защитная реакция часто выглядит как злость, но корень зарыт глубже.

**Практика / Готовая фраза**: Попробуйте взять паузу на 15 минут и сказать ${partner2Name}:
«Мне очень жаль, что наш разговор зашёл в тупик. Я очень ценю нас и хочу всё обсудить спокойно, когда эмоции немного утихнут».

**Вопрос для вас**: Какая именно ваша неудовлетворённая потребность стоит за этой ситуацией?`;
  }

  if (text.includes('ревн') || text.includes('измен') || text.includes('не довер')) {
    return `**Взгляд психолога**: Ревность — это не признак нелюбви, а подсвеченный страх утраты безопасности и ценности в глазах партнёра.

**Практика / Готовая фраза**: Поделитесь чувством через уязвимость с ${partner2Name}:
«Знаешь, иногда во мне просыпается тревога. Мне очень важно слышать, что я для тебя ценен и важен».

**Вопрос для вас**: Что партнёр может сделать сегодня, чтобы вы почувствовали большую надёжность?`;
  }

  if (
    text.includes('устал') ||
    text.includes('быт') ||
    text.includes('рутин') ||
    text.includes('нет времени')
  ) {
    return `**Взгляд психолога**: Накопленная бытовая усталость незаметно истощает эмоциональный баланс пары. Если не пополнять «банк теплых впечатлений», обычные мелочи начинают раздражать.

**Практика / Готовая фраза**: Договоритесь о 10-минутном ритуале с ${partner2Name}:
«Давай сейчас на 10 минут отложим все телефоны и дела, просто выпьем чаю и обнимемся».

**Вопрос для вас**: Какую одну бытовую обязанность вы можете облегчить или перераспределить на этой неделе?`;
  }

  if (
    text.includes('внимани') ||
    text.includes('одиночест') ||
    text.includes('холод') ||
    text.includes('отдаля')
  ) {
    return `**Взгляд психолога**: Чувство дистанции в отношениях — это естественный сигнал о том, что ваш эмоциональный контакт требует обновления.

**Практика / Готовая фраза**: Задайте ${partner2Name} тёплый открытый вопрос:
«Я соскучился по нашим глубоким разговорам. Как ты себя чувствуешь в последнее время и о чём чаще всего думаешь?»

**Вопрос для вас**: Какое совместное занятие раньше приносило вам больше всего радости и лёгкости?`;
  }

  return `**Взгляд психолога**: Любые переживания в паре — это точка роста для вашего эмоционального контакта. Главное — подходить к диалогу не из позиции претензий, а из желания понять друг друга.

**Практика / Готовая фраза**: Попробуйте сформулировать мысль через Я-высказывание:
«Я чувствую тревогу, когда происходят подобные ситуации, потому что для меня очень важна наша близость с ${partner2Name}».

**Вопрос для вас**: Что прямо сейчас поможет вам почувствовать себя одной уверенной командой?`;
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
