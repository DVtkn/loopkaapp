import { Router } from "express";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { aiLimiter } from "../../shared/middleware/rateLimiter.ts";
import {
  chatMessageCreateSchema,
  aiChatMessageSchema,
  aiReportSchema,
  aiDateIdeaSchema,
} from "../../shared/validators/chat.validator.ts";
import {
  getCoupleChatMessages,
  saveChatMessage,
  getAIMessages,
  callGroqChat,
  generateSmartPsychologistReply,
  saveAIMessageToDb,
} from "./chat.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const chatRouter = Router();

chatRouter.get("/messages/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const coupleId = String(req.params.coupleId || "");
    const messages = await getCoupleChatMessages(coupleId);
    return res.json({ messages });
  } catch (err) {
    logger.error("Ошибка получения сообщений чата", err);
    return res.status(500).json({ error: "Ошибка загрузки чата" });
  }
});

chatRouter.post("/messages", requireAuth, requirePairOwnership, validateBody(chatMessageCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { coupleId, senderLogin, content, role } = req.body;
    const userLogin = req.user?.login;

    if (senderLogin !== userLogin) {
      return res.status(403).json({ error: "Нельзя отправлять сообщения от чужого имени" });
    }

    const message = await saveChatMessage({ coupleId, senderLogin, content, role });
    return res.status(201).json({ message });
  } catch (err) {
    logger.error("Ошибка сохранения сообщения чата", err);
    return res.status(500).json({ error: "Ошибка отправки сообщения" });
  }
});

export const aiRouter = Router();

aiRouter.get("/messages/:login", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const login = String(req.params.login || "").toLowerCase().replace(/^@/, "");
    const messages = await getAIMessages(login);
    return res.json({ messages });
  } catch (err) {
    logger.error("Ошибка загрузки сообщений ИИ", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

aiRouter.post("/chat", aiLimiter, requireAuth, validateBody(aiChatMessageSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { messages, userLogin: bodyLogin } = req.body;
    const coupleContext = req.body.context || req.body.coupleContext;
    const currentPartner = req.body.currentPartner;
    const callerLogin = req.user?.login || bodyLogin;

    const partnerName = currentPartner?.name || "Партнёр";
    const partner2Name = coupleContext?.user2?.name || "Второй партнёр";

    const systemPrompt = `Ты — Сова, опытный, бережный и доказательный семейный психолог приложения для пар Loop.

ТВОЙ СТИЛЬ:
- Говори как настоящий чуткий психотерапевт: спокойно, поддерживающе, структурно и предельно ЛАКОНИЧНО.
- БЕЗ ВОДЫ И ШАБЛОННЫХ ВСТУПЛЕНИЙ: сразу переходи к сути вопроса.
- ДЛИНА ОТВЕТА: строго 70–130 слов (2-3 коротких смысловых блока). Ответ должен легко считываться с экрана смартфона за 20 секунд.

ФОРМАТИРОВАНИЕ ОТВЕТА:
- Используй только обычный текст, абзацы и эмодзи.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать Markdown-таблицы, блоки кода или HTML-теги.
- Отвечай строго как эмпатичный собеседник в мессенджере.

СМЫСЛОВАЯ СТРУКТУРА ОТВЕТА:
1. **Взгляд психолога** (1–2 ёмких предложения: валидация чувств и корень динамики в паре).
2. **Практика / Готовая фраза** (1–2 точечных шага с конкретным речевым шаблоном в кавычках: «...», например по методу Готтмана или Я-высказыванию).
3. **Вопрос для вас** (1 точный, глубокий вопрос для диалога с собой или партнёром).

КАТЕГОРИЧЕСКИЕ ЗАПРЕТЫ:
- ❌ КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ любые таблицы (никаких символов «|---|---|» или ASCII-колонок).
- ❌ ЗАПРЕЩЕНЫ длинные простыни текста, банальности («вам просто нужно поговорить») и заумная терминология.
- ❌ ЗАПРЕЩЕН ОФФТОП (программирование, рецепты, политика, ремонт): вежливо откажись в одно тёплое предложение и верни тему к отношениям и чувствам.

Контекст пары:
- Собеседник: ${partnerName}
- Партнёр: ${partner2Name}
- Дней вместе: ${coupleContext?.daysTogether || 1}
- Язык любви ${partnerName}: ${coupleContext?.user1?.loveLanguage || "не указан"}
- Язык любви ${partner2Name}: ${coupleContext?.user2?.loveLanguage || "не указан"}`;

    const lastUserMessage = messages[messages.length - 1];
    const lastUserText = lastUserMessage?.content || "";

    // Guardrail off-topic check
    const offTopicKeywords = [
      "шкаф", "код", "программ", "python", "javascript", "машин", "ремонт",
      "рецепт", "пирог", "президент", "политик", "забудь", "игнорируй"
    ];
    if (offTopicKeywords.some((k) => lastUserText.toLowerCase().includes(k))) {
      return res.json({
        reply: "Я семейный психолог Сова и специализируюсь исключительно на отношениях, чувствах и гармонии в паре.\n\nФизические и технические инструкции лучше посмотреть в руководстве пользователя. А если в процессе совместного дела возникло недопонимание — я с радостью помогу всё экологично уладить! О чём в отношениях вы хотите поговорить?",
        mode: "fallback_guardrail",
      });
    }

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    const groqReply = await callGroqChat(groqMessages);
    if (groqReply) {
      await saveAIMessageToDb(callerLogin, lastUserText, groqReply);
      return res.json({ reply: groqReply, mode: "groq" });
    }

    const smartReply = generateSmartPsychologistReply(lastUserText, partnerName, partner2Name);
    await saveAIMessageToDb(callerLogin, lastUserText, smartReply);
    return res.json({
      reply: smartReply,
      mode: "smart_psychologist_engine",
    });
  } catch (err: unknown) {
    logger.error("Ошибка в AI чате Совы", err);
    const partnerName = req.body?.currentPartner?.name || "Партнёр";
    const partner2Name = req.body?.coupleContext?.user2?.name || "партнёр";
    const lastUserText = req.body?.messages?.slice(-1)?.[0]?.content || "";
    const fallback = generateSmartPsychologistReply(lastUserText, partnerName, partner2Name);
    await saveAIMessageToDb(req.user?.login, lastUserText, fallback);
    return res.json({
      reply: fallback,
      mode: "safety_fallback",
    });
  }
});

aiRouter.post("/generate-report", aiLimiter, requireAuth, validateBody(aiReportSchema), async (req, res, next) => {
  try {
    const { coupleProfile, radarScores } = req.body;
    const prompt = `Проанализируй данные пары для приложения Loop и составь глубокий психологический отчёт:
Данные пары: ${JSON.stringify({ coupleProfile, radarScores })}

Верни строго JSON:
{
  "title": "краткий вдохновляющий заголовок архетипа пары",
  "summary": "вывод на 3-4 предложения",
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "growthZones": ["зона роста 1", "зона роста 2"],
  "gottmanTips": "рекомендация по методу Готтмана с упражнением"
}`;

    const groqReply = await callGroqChat([
      { role: "system", content: "Ты — эксперт семейной психологии. Отвечай строго валидным JSON без markdown." },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        return res.json(parsed);
      } catch (err: unknown) {
        logger.warn("Сбой парсинга JSON ответа Groq для отчета", undefined, err);
      }
    }

    return res.json({
      title: "Гармоничный союз глубокой привязанности",
      summary: "Ваша пара демонстрирует высокий уровень взаимного уважения и эмоциональной поддержки. Ключевая сила союза — готовность слышать переживания партнёра.",
      strengths: ["Чуткое отношение к эмоциональному состоянию", "Открытость к диалогу", "Общие базовые ценности"],
      growthZones: ["Уделять больше времени совместному спонтанному отдыху", "Синхронизация бытовых ожиданий"],
      gottmanTips: "Практикуйте ежедневный 15-минутный ритуал «Разгрузка после рабочего дня»: слушайте партнёра без критики и советов, проявляя чистую эмпатию.",
    });
  } catch (err: unknown) {
    logger.error("Ошибка генерации отчета пары", err);
    return res.status(500).json({ error: "Ошибка генерации отчета" });
  }
});

aiRouter.post("/date-idea", aiLimiter, requireAuth, validateBody(aiDateIdeaSchema), async (req, res, next) => {
  try {
    const { budget, vibe, location, coupleProfile } = req.body;
    const prompt = `Придумай оригинальное свидание для пары в Loop:
Бюджет: ${budget || "умеренный"}
Атмосфера: ${vibe || "романтичная"}
Локация: ${location || "в городе или дома"}
Профиль: ${JSON.stringify(coupleProfile || {})}

Верни строго JSON:
{
  "title": "название свидания",
  "tagline": "короткий цепляющий слоган",
  "description": "описание сценария на 2-3 предложения",
  "prepSteps": ["шаг 1", "шаг 2"],
  "conversationStarters": ["вопрос для пары 1", "вопрос для пары 2"]
}`;

    const groqReply = await callGroqChat([
      { role: "system", content: "Ты — креативный продюсер свиданий и психолог отношений. Отвечай валидным JSON." },
      { role: "user", content: prompt },
    ]);

    if (groqReply) {
      try {
        const clean = groqReply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return res.json(JSON.parse(clean));
      } catch (err: unknown) {
        logger.warn("Сбой парсинга JSON ответа Groq для свидания", undefined, err);
      }
    }

    return res.json({
      title: "Гастрономическое путешествие вслепую",
      tagline: "Вкус, доверие и новые тактильные впечатления",
      description: "Один из вас надевает повязку на глаза, а второй угощает заранее подготовленными необычными вкусами (сыры, ягоды, шоколад с солью). Затем меняетесь ролями.",
      prepSteps: ["Купить 4-5 контрастных закусок", "Подготовить мягкую повязку на глаза", "Включить медленный джаз или эмбиент"],
      conversationStarters: ["Какой момент наших отношений был для тебя самым вкусным и ярким?", "Какое блюдо или поездка больше всего запомнились нам обоим?"],
    });
  } catch (err: unknown) {
    logger.error("Ошибка генерации свидания", err);
    return res.status(500).json({ error: "Ошибка генерации свидания" });
  }
});
