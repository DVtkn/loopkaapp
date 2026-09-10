# Loop — Product Requirements Document (PRD) & Technical Architecture Spec

**Версия документа:** 2.2.0 (Anti-Manipulative Psychometrics & 2-Tier Data Aggregation Pyramid)  
**Статус:** Единый источник правды (SSOT) по продукту, математическому движку и архитектуре  
**Стек:** React 19 • Node.js / Express 4 • PostgreSQL (Neon) • Drizzle ORM • Groq Cloud

---

## 1. Миссия, позиционирование и границы продукта

**Loop** — мобильно-ориентированное веб-приложение для гетеросексуальных пар (мужчина + женщина), объединяющее доказательную психологическую самодиагностику и ежедневные микро-практики для укрепления эмоциональной связи.

### 1.1. Базовые принципы
* **Диагностика и профилактика, а не клиническая терапия**: сервис помогает выявить слепые зоны, паттерны конфликтов и скрытые потребности до того, как они перерастут в кризис.
* **Вторичность микро-касаний**: быстрые проявления внимания (касания, вопрос дня, вишлисты заботы) служат исключительно клеем для удержания контакта между регулярными сессиями глубокой совместной работы, а не самоцелью.
* **Строгая детерминированность аналитики**: никаких галлюцинаций LLM при оценке отношений. Все тесты, графики, скоринг и отчеты строятся на математических формулах и экспертных матрицах правил.
* **ИИ как фасилитатор, а не судья**: ИИ-ассистент Сова доступен только по запросу пользователя в выделенном чате и не вмешивается в повседневную жизнь пары без явного обращения.

### 1.2. Non-goals (Границы продукта)
* Приложение не является социальной сетью: нет публичных профилей, ленты постов и шеринга наружу.
* Приложение не заменяет семейного терапевта при острых патологиях и не ставит клинических диагнозов.
* Приложение не является общим планировщиком бытовых задач, заметок или семейным трекером бюджета.

---

## 2. Многомерная система пользовательских персон

В парном продукте персона — это не изолированный демографический профиль, а человек с его индивидуальной структурой личности, языком контакта и защитными механизмами, помещенный в парное взаимодействие.

Система персон Loop строится на трех взаимодополняющих осях:
* **Ведущая роль в цикле контакта (ЭФТ и привязанность)** — кто начинает и как реагирует на уязвимость.
* **Психологический склад и язык коммуникации** — как человек формулирует мысли и считывает заботу.
* **Конфликтная динамика пары** — какой совместный паттерн пара активирует в стрессе.

### Срез 1. Ведущая роль в цикле контакта (Динамика привязанности)

#### 1. «Хранитель связи» (The Anchor / Pursuer)
* **Психологический профиль**: тревожный или тревожно-надежный стиль привязанности (ECR-R: Anxiety $\ge$ 50). Высокий эмоциональный интеллект, острая чувствительность к микро-сигналам дистанцирования. Часто является инициатором установки Loop (80% случаев первого скачивания).
* **Внутренний монолог**: «Я устал(а) быть единственным двигателем нашей близости. Мне нужно подтверждение, что меня замечают и ценят так же сильно».
* **Поведение в Loop**: проходит тесты за 5 минут, с тревогой ожидает ответов партнера, регулярно отправляет касания и инициирует вопросы дня.
* **Главный риск оттока**: фрустрация и обида при медленном или формальном прохождении тестов партнером («Ему/ей это не нужно, зачем я стараюсь»).
* **Продуктовое решение в Loop**: интерфейс валидирует усилия, снижает тревогу ожидания («Партнер подключился, дайте ему время освоиться») и снимает с Хранителя роль надзирателя.

#### 2. «Осторожный защитник» (The Fort / Distancer)
* **Психологический профиль**: избегающе-отвергающий стиль (ECR-R: Avoidance $\ge$ 50), высокий самоконтроль. Искренне любит партнера, но в моменты эмоционального давления впадает в ступор или замыкается. Приходит в продукт по инвайту.
* **Внутренний монолог**: «Меня постоянно упрекают в эмоциональной закрытости. Я хочу покоя и мира, но не понимаю, чего от меня требуют без упреков и ссор».
* **Поведение в Loop**: осторожен на онбординге, ищет подвох в тестах, ценит режим «Соло», конкретику и логику (Big Five, фактологические вопросы Готтмана).
* **Главный риск оттока**: ощущение, что Loop — инструмент манипуляции или обвинения со стороны партнера.
* **Продуктовое решение в Loop**: асинхронный темп без давления, фокус на безопасности («Здесь нет неправильных ответов и оценок»), четкие детерминированные отчеты.

#### 3. «Осознанный архитектор» (The Optimizer)
* **Психологический профиль**: высокая добросовестность по Big Five (Conscientiousness $\ge$ 65), надежная привязанность. Воспринимает отношения как союз, требующий осознанного развития и регулярной профилактики.
* **Внутренний монолог**: «У нас все стабильно, но быт и рутина могут незаметно вытеснить близость. Отношениям нужна гигиена и ориентиры».
* **Поведение в Loop**: глубоко изучает «Радар гармонии», отслеживает динамику шкал, регулярно использует конструктор свиданий и капсулы времени.
* **Главный риск оттока**: отсутствие глубины, повторяющиеся поверхностные формулировки отчетов («Мы это и так знаем»).
* **Продуктовое решение в Loop**: многомерная кросс-аналитика, отслеживание трендов в `relationship_metrics`, доступ к сложным интегративным тестам.

### Срез 2. Психологический склад и язык коммуникации

| Интуитивный эмпат | Прагматичный логик | Сомневающийся искатель |
|---|---|---|
| **Язык**: эмоции, метафоры, невербальные сигналы. | **Язык**: действия, помощь, факты, тайм-менеджмент. | **Язык**: подстройка, уступки, подавленные желания. |
| **Боль**: обида на отсутствие эмоциональной догадливости («Ты должен сам понять»). | **Боль**: раздражение от абстрактных разговоров без конкретного плана. | **Боль**: потеря собственного голоса в паре, накопленная скрытая обида. |
| **Фича**: «Книга заботы» и карточки «Языков любви». | **Фича**: детерминированные «Фразы-мостики» в радаре. | **Фича**: тесты Класса Б (Big Five, Личные ценности). |

* **«Интуитивный эмпат»**: ориентирован на эмоциональный климат. Loop помогает перевести неоформленные переживания в структурированные потребности, снижая требование «читать мысли».
* **«Прагматичный логик»**: ориентирован на результат. Loop дает четкие поведенческие скрипты коммуникации без эзотерики и абстрактных манипуляций.
* **«Сомневающийся искатель»**: сниженная саморефлексия и размытые личные границы. Loop предлагает индивидуальные тесты Класса Б для первичного самоопределения перед совместным диалогом.

### Срез 3. Конфликтная динамика пары (Паттерны проживания стресса)

| Тип динамики | Проявление в паре | Риск для отношений без Loop | Роль Loop и ключевой модуль |
|---|---|---|---|
| **«Взрывной контакт»** | Экспрессивные споры, резкая эскалация, быстрый спад эмоций | Накопление эмоционального истощения и взаимных микро-травм | ЭФТ-матрица: фиксация триггеров и алгоритм паузы (тайм-аут 20 мин) |
| **«Тихий омут»** | Замалчивание разногласий, страх конфликта, уход в бытовой холод | Медленная эрозия близости, секса и переход в режим «соседи» | Deep Talk / Вопрос дня: безопасная среда для обсуждения табу |
| **«Несинхронные ритмы»** | Разный темп жизни, разные уровни потребности в автономии | Один задыхается от контроля, второй страдает от изоляции | Радар «Схожесть ритмов»: легализация личных границ через Big Five |

---

## 3. Матрица фич и приоритеты (P-Level)

* **P0 (Must Have — ядро функционирования):**
  * Аутентификация: логин, пароль, обязательное поле `gender` (`male` | `female`).
  * Связывание пары: инвайт-код с технической проверкой разнополости `genderA !== genderB`.
  * SSE-инфраструктура мгновенных эмоциональных сигналов («Обнять», «Скучаю», «Поцелуй», «Ценю»).
  * Вводный совместный тест «5 языков любви» (Класс А) с атомарной генерацией отчета.
  * Fail-Fast инициализация бэкенда в проде и серверный пересчет XP (защита от клиентских инъекций).

* **P1 (Should Have — глубокая ценность):**
  * Каталог методик: ECR-R (привязанность), BFI-20 (Big Five), Карта Готтмана, ЭФТ-матрица, Ценности Шварца.
  * Экран «Радар гармонии» (Recharts) с карточками роста (триггеры и фразы-мостики).
  * Механика «Вопрос дня» с защитой от рассинхрона по часовым поясам (00:00 UTC).
  * Чат с Совой (режимы Соло и Вместе) с контекстной подгрузкой метрик и кризисным Safety-фильтром.

* **P2 (Could Have — обогащение опыта):**
  * Раздел «Свидания»: колесо идей, планировщик отложенных встреч для пар на дистанции, история свиданий.
  * Капсула времени: запечатанные послания с датой открытия в будущем.
  * Книга заботы: персональные вишлисты с явным флагом приватности (`is_private`).
  * Система уровней пары и ачивок за завершение глубоких психологических треков.

---

## 4. Психометрический каталог и пайплайн оценки

Модуль психометрии работает как двухуровневый измерительный пайплайн:
* **Психометрический слой**: сбор сырых ответов и нормализация к шкале $S_{norm} \in [0.0; 100.0]$.
* **Матричный движок комбинаций**: сведение индивидуальных векторов партнеров в парные паттерны без участия LLM.

```
Уровень 1 (P0): Вводный контакт ────► 5 языков любви (Класс А)
Уровень 2: Личный базис         ────► Стиль привязанности (ECR-R, Класс Б) + Big Five (Класс Б)
Уровень 3: Диагностика пары     ────► Карта любви Готтмана (Класс А)
Уровень 4: Глубокая динамика    ────► ЭФТ-матрица циклов конфликта (Класс А)
Уровень 5: Горизонт союза       ────► Ценности и приоритеты (Класс Б -> Класс А)
```

### 4.1. Каталог психологических методик

| ID теста | Название | Методологическая база | Класс | Объем | Формат | Роль в аналитике |
|---|---|---|---|---|---|---|
| `test_love_languages` | 5 языков любви | Г. Чепмен (ипсативный) | А | 15 ситуаций | Выбор из 2 опций | Языковой резонанс, индекс разрыва каналов заботы |
| `test_attachment_indiv` | Стиль привязанности | ECR-R (Brennan et al.) | Б | 18 пунктов | Ликерт (1..7) | Базовые оси: тревожность и избегание |
| `test_big_five_aspects` | Личностный профиль | BFI-20 (Goldberg, John) | Б | 20 пунктов | Ликерт (1..5) | 5 базовых черт (OCEAN), схожесть ритмов |
| `test_gottman_map` | Карта любви | Gottman Love Lab | А | 20 пунктов | Бинарный выбор | Актуальность карты внутреннего мира партнера |
| `test_eft_cycles` | Циклы конфликта | ЭФТ (Сью Джонсон) | А | 16 ситуаций | Выбор реакции | Выявление деструктивных петель ссор |
| `test_life_values` | Ценности и ориентиры | PVQ (Шварц в адаптации) | Б $\rightarrow$ А | 15 сфер | Ранжирование топ-5 | Долгосрочная мировоззренческая совместимость |

### 4.2. Формулы нормализации и скоринга

Для пунктов со шкалой Ликерта от `MinScore` до `MaxScore`:
$$S_{norm} = \frac{\sum (x_i^{inv} - MinScore)}{N \cdot (MaxScore - MinScore)} \times 100$$

где $x_i^{inv}$ учитывает инверсию для reverse-scored утверждений:
$$x_i^{inv} = (MaxScore + MinScore) - x_i$$

**Детализация шкал:**
* **5 языков любви**: Сумма баллов по 5 шкалам равна 100%:
  $$\sum_{k=1}^5 S_k = 100\%$$
  Индекс разрыва языков (Language Gap):
  $$\Delta_{lang} = \frac{1}{2} \sum_{k=1}^5 |S_{k}^{A} - S_{k}^{B}|$$
  Если $\Delta_{lang} \ge 40\%$, интерфейс фиксирует статус «Критический языковой барьер».
* **Стиль привязанности (ECR-R)**: ортогональные оси тревожности (Anx) и избегания (Avd) $[0..100]$:
  * $Anx < 50 \land Avd < 50 \implies$ Надежный
  * $Anx \ge 50 \land Avd < 50 \implies$ Тревожный
  * $Anx < 50 \land Avd \ge 50 \implies$ Избегающе-отвергающий
  * $Anx \ge 50 \land Avd \ge 50 \implies$ Тревожно-избегающий (дезорганизованный)
* **ЭФТ-матрица ссор**:
  Сопоставление тенденций преследования (pursuit) и отстранения (withdrawal) партнеров. При комбинации «Высокое преследование у Женщины ($\ge 60$) + Высокое отстранение у Мужчины ($\ge 60$)» движок классифицирует петлю:
  ```
  [Тревога женщины] ──► [Давление/Критика] ──► [Стресс мужчины] ──► [Уход в глухую оборону]
       ▲                                                                    │
       └─────────────────── [Усиление паники/Одиночество] ◄─────────────────┘
  ```
  В отчет подставляются детерминированные инструкции: замедление темпа для преследователя и фиксация тайм-аута с обязательством вернуться для отстраняющегося.

---

## 5. Полная техническая архитектура системы

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 КЛИЕНТСКИЙ СЛОЙ (SPA)                                   │
│                        React 19 • TypeScript • Vite • Tailwind CSS                      │
│                                                                                         │
│  src/context/                                                                           │
│  ├── AuthContext.tsx         — JWT, сессия юзера, права доступа                         │
│  ├── PairingContext.tsx      — статус связи пары, инвайты, профиль партнера             │
│  ├── RealtimeContext.tsx     — SSE-соединение, heartbeat, тосты касаний                 │
│  ├── CoupleDataContext.tsx   — тесты, радар гармонии, вопрос дня, свидания              │
│  └── GamificationContext.tsx — уровень пары, стрик, XP                                  │
│                                                                                         │
│  src/components/ui/SystemBlocks.tsx: StatTile | CarouselTile | ActionRow | PrimaryCTA  │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ HTTPS REST API + SSE Stream
┌────────────────────────────────────────────▼────────────────────────────────────────────┐
│                           СЕРВЕРНЫЙ СЛОЙ (Node.js / Express 4)                          │
│  Точка входа: server.ts → src/server/index.ts                                           │
│  Shared: authMiddleware, requirePairOwnership, strictRateLimiter, zodValidation         │
│                                                                                         │
│  src/server/modules/                                                                    │
│  ├── auth/         — Регистрация, логин, смена пароля, валидация пола                   │
│  ├── pairing/      — Коды приглашений, проверка разнополости, транзакционный коннект    │
│  ├── tests/        — Сессии, транзакционный прием ответов, матричный скоринг            │
│  ├── couple-data/  — Синхронизация свиданий, книги заботы, вопросов дня, капсулы       │
│  ├── analytics/    — Генерация радара гармонии, карточек роста, экспорт данных          │
│  ├── chat/         — Единственная точка вызова Groq LLM (промпты Совы, Safety-фильтр)   │
│  ├── photos/       — Управление памятными снимками пары                                 │
│  └── realtime/     — Менеджер SSE-подключений, рассылка касаний, пинги 25с              │
└───────────────────────┬─────────────────────────────────────────┬───────────────────────┘
                        │                                         │
┌───────────────────────▼───────────────────────┐ ┌───────────────▼───────────────────────┐
│         СЛОЙ ХРАНЕНИЯ ДАННЫХ                  │ │          ВНЕШНИЕ СЕРВИСЫ              │
│  PostgreSQL (Neon Cloud) + Drizzle ORM        │ │  • Groq Cloud API (Llama-3.3-70b)     │
│  • Production: Строгий Fail-Fast (no JSON)    │ │  • Fallback: psychologyEngine.ts      │
│  • Development: Авто-фоллбэк на JSON          │ │  • Web Push API (RFC 8291 / VAPID)    │
└───────────────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 6. Детальная схема базы данных (Drizzle ORM)

```ts
// src/server/db/schema.ts
import { 
  pgTable, uuid, varchar, text, integer, jsonb, 
  timestamp, boolean, uniqueIndex 
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  login: varchar('login', { length: 64 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  gender: varchar('gender', { length: 16 }).notNull(), // 'male' | 'female'
  city: varchar('city', { length: 128 }),
  timezone: varchar('timezone', { length: 64 }).default('UTC').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const couples = pgTable('couples', {
  id: uuid('id').defaultRandom().primaryKey(),
  userMaleId: uuid('user_male_id').references(() => users.id).notNull(),
  userFemaleId: uuid('user_female_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 32 }).default('active').notNull(), // 'active' | 'archived'
  startDate: timestamp('start_date', { withTimezone: true }),
  xpPoints: integer('xp_points').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  brokenAt: timestamp('broken_at', { withTimezone: true })
});

export const pairRequests = pgTable('pair_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  receiverLogin: varchar('receiver_login', { length: 64 }).notNull(),
  inviteCode: varchar('invite_code', { length: 16 }).notNull().unique(),
  status: varchar('status', { length: 32 }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const tests = pgTable('tests', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  testClass: varchar('test_class', { length: 16 }).notNull(), // 'couple' | 'individual'
  version: integer('version').default(1).notNull(),
  orderIndex: integer('order_index').notNull(),
  isActive: boolean('is_active').default(true).notNull()
});

export const testSessions = pgTable('test_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  testId: varchar('test_id', { length: 64 }).references(() => tests.id).notNull(),
  testClass: varchar('test_class', { length: 16 }).notNull(),
  coupleId: uuid('couple_id').references(() => couples.id),
  status: varchar('status', { length: 32 }).default('in_progress').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const testAnswers = pgTable('test_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => testSessions.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  questionId: varchar('question_id', { length: 64 }).notNull(),
  selectedValue: integer('selected_value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userQuestionIdx: uniqueIndex('user_session_question_idx').on(table.sessionId, table.userId, table.questionId)
}));

export const userPsychProfiles = pgTable('user_psych_profiles', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  scores: jsonb('scores').notNull(),
  dominantTraits: jsonb('dominant_traits').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const coupleReports = pgTable('couple_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => testSessions.id).notNull(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  testId: varchar('test_id', { length: 64 }).references(() => tests.id).notNull(),
  pairMetrics: jsonb('pair_metrics').notNull(),
  insights: jsonb('insights').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const quickTouches = pgTable('quick_touches', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  touchType: varchar('touch_type', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const dailyQuestionAnswers = pgTable('daily_question_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  questionDate: varchar('question_date', { length: 10 }).notNull(),
  answerText: text('answer_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pairUserDateIdx: uniqueIndex('couple_user_date_idx').on(table.coupleId, table.userId, table.questionDate)
}));

export const careNotes = pgTable('care_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  content: text('content').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const dateEvents = pgTable('date_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  plannedAt: timestamp('planned_at', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 32 }).default('planned').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const timeCapsules = pgTable('time_capsules', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  sealedContent: text('sealed_content').notNull(),
  unlockAt: timestamp('unlock_at', { withTimezone: true }).notNull(),
  isOpened: boolean('is_opened').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  mode: varchar('mode', { length: 16 }).notNull(),
  role: varchar('role', { length: 16 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  coupleId: uuid('couple_id').references(() => couples.id).notNull(),
  uploaderId: uuid('uploader_id').references(() => users.id).notNull(),
  caption: varchar('caption', { length: 255 }),
  imageData: text('image_data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull().unique(),
  keys: jsonb('keys').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
```

---

## 7. Внутренний механизм завершения тестов (Race-Condition Free)

Для предотвращения коллизий при одновременной отправке ответов обоими партнерами процедура фиксации теста выполняется в транзакции с блокировкой строки сессии:

```ts
// src/server/modules/tests/tests.service.ts
import { db } from '../../db/client';
import { testSessions, testAnswers, userPsychProfiles, coupleReports, couples } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { calculatePsychometrics } from './psychometrics.calc';
import { generateDeterministicReport } from './report.matrix';

export async function submitAnswerAndCheckCompletion(
  sessionId: string,
  userId: string,
  questionId: string,
  selectedValue: number
) {
  return await db.transaction(async (tx) => {
    // 1. Атомарно блокируем сессию
    const [session] = await tx
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, sessionId))
      .for('update');

    if (!session || session.status === 'completed') {
      return { status: 'already_completed' };
    }

    // 2. Записываем ответ (upsert)
    await tx
      .insert(testAnswers)
      .values({ sessionId, userId, questionId, selectedValue })
      .onConflictDoUpdate({
        target: [testAnswers.sessionId, testAnswers.userId, testAnswers.questionId],
        set: { selectedValue, createdAt: new Date() }
      });

    // 3. Для индивидуальных тестов (Класс Б) завершаем сразу
    if (session.testClass === 'individual') {
      const answers = await tx.select().from(testAnswers).where(eq(testAnswers.sessionId, sessionId));
      const scores = calculatePsychometrics(session.testId, answers);
      
      await tx.insert(userPsychProfiles).values({
        userId,
        scores: scores.normalized,
        dominantTraits: scores.dominants,
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: userPsychProfiles.userId,
        set: { scores: scores.normalized, dominantTraits: scores.dominants, updatedAt: new Date() }
      });

      await tx.update(testSessions)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(testSessions.id, sessionId));

      return { status: 'individual_completed', scores };
    }

    // 4. Для парных тестов (Класс А) проверяем участие обоих партнеров
    const completedUsers = await tx
      .select({ userId: testAnswers.userId, count: sql<number>`count(*)` })
      .from(testAnswers)
      .where(eq(testAnswers.sessionId, sessionId))
      .groupBy(testAnswers.userId);

    const bothFinished = completedUsers.length === 2 && completedUsers.every(u => Number(u.count) >= 15);

    if (!bothFinished) {
      return { status: 'waiting_for_partner' };
    }

    // 5. Оба завершили — выполняем детерминированный скоринг
    const allAnswers = await tx.select().from(testAnswers).where(eq(testAnswers.sessionId, sessionId));
    const [userA, userB] = completedUsers.map(u => u.userId);
    
    const scoresUserA = calculatePsychometrics(session.testId, allAnswers.filter(a => a.userId === userA));
    const scoresUserB = calculatePsychometrics(session.testId, allAnswers.filter(a => a.userId === userB));

    const reportPayload = generateDeterministicReport(session.testId, scoresUserA.normalized, scoresUserB.normalized);

    // 6. Сохраняем общий отчет
    await tx.insert(coupleReports).values({
      sessionId,
      coupleId: session.coupleId!,
      testId: session.testId,
      pairMetrics: reportPayload.metrics,
      insights: reportPayload.insights,
      createdAt: new Date()
    });

    // 7. Помечаем сессию завершенной и начисляем XP паре
    await tx.update(testSessions)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(testSessions.id, sessionId));

    await tx.update(couples)
      .set({ 
        xpPoints: sql`${couples.xpPoints} + 150`,
        currentLevel: sql`FLOOR((${couples.xpPoints} + 150) / 500) + 1`
      })
      .where(eq(couples.id, session.coupleId!));

    return { status: 'couple_report_ready', report: reportPayload };
  });
}
```

---

## 8. Realtime-подсистема (SSE + Web Push)

```
[Пользователь А] ─── POST /api/couple/touches ───► [Express Backend]
                                                            │
                                                     Postgres INSERT
                                                            │
                                                     RealtimeManager (In-Memory Map)
                                                            │
[Пользователь Б] ◄─── SSE Event: quick_touch ───────────────┘
```

### 8.1. Спецификация SSE-потока
* **Маршрут**: `GET /api/couple/events-stream/:login`
* **Заголовки**:
  * `Content-Type: text/event-stream`
  * `Cache-Control: no-cache, no-transform`
  * `Connection: keep-alive`
  * `X-Accel-Buffering: no` (предотвращение буферизации Nginx/Cloudflare)
* **Heartbeat**: Пакет `: ping\n\n` каждые 25 секунд.
* **События**: `quick_touch`, `partner_status`, `test_partner_finished`, `daily_question_revealed`.

### 8.2. Web Push (VAPID)
Используется только при закрытом приложении. Сервер отправляет пуш через `web-push`, если у получателя отсутствует активное SSE-соединение дольше 15 секунд.

---

## 9. Чат с Совой и Safety-фильтр при рисках

```ts
// src/server/modules/chat/safety.filter.ts
const CRITICAL_RISK_PATTERNS = [
  /суицид|покончить с собой|не хочу жить|убить себя/i,
  /бьет меня|ударил|душит|угрожает расправой|боюсь за свою жизнь/i,
  /самоповрежден|режу вены|сделать с собой/i
];

export function evaluateSafetyRisk(text: string): { hasRisk: boolean; response?: string } {
  const matches = CRITICAL_RISK_PATTERNS.some(pattern => pattern.test(text));
  if (!matches) return { hasRisk: false };

  return {
    hasRisk: true,
    response: 
      "Я чувствую, как вам тяжело и небезопасно прямо сейчас. " +
      "Пожалуйста, обратитесь к тем, кто может оказать квалифицированную помощь немедленно:\n\n" +
      "• Единый телефон доверия: 8-800-2000-122 (бесплатно, анонимно)\n" +
      "• Кризисный центр помощи женщинам: 8-800-7000-600\n" +
      "• Неотложная психологическая помощь: 051 (с городского) или +7 (495) 051\n\n" +
      "Я алгоритм и не могу заменить кризисного специалиста. Сделайте этот шаг ради вашей безопасности."
  };
}
```

**Правила обработки:**
* Запрос проверяется через `evaluateSafetyRisk()`. При совпадении системная помощь возвращается сразу, запрос к LLM блокируется.
* В режиме `solo` факт срабатывания кризисного фильтра и само сообщение не отправляются партнеру и не отражаются в общих событиях пары.
* При штатном диалоге сервер передает в Groq LLM (`llama-3.3-70b-versatile`) промпт с тремя блоками в ответе:
  * **[Взгляд психолога]** — валидация эмоций без критики.
  * **[Готовая фраза]** — безопасный ненасильственный коммуникативный шаблон.
  * **[Вопрос для вас]** — открытый вопрос для саморефлексии.

---

## 10. Декомпозиция клиентского состояния (React 19)

Вместо монолитного `CoupleContext.tsx` клиентское приложение использует модульную структуру провайдеров:
```
src/context/
├── AuthContext.tsx         — JWT, сессия, смена профиля
├── PairingContext.tsx      — отправка и принятие инвайтов, статус связи
├── RealtimeContext.tsx     — SSE-подключение, обработка входящих касаний
├── CoupleDataContext.tsx   — тесты, радар гармонии, свидания, вопросы дня
└── GamificationContext.tsx — уровень пары, прогресс-бар XP, стрик
```

**Стандарты UI:**
* *Sentence case* во всех надписях (запрещен ALL CAPS).
* Текст переносится через `line-clamp`, запрещено скрывать обрезкой `truncate` важные смысловые поля.
* Все карточки строятся строго из компонентов дизайн-системы `SystemBlocks.tsx` (`StatTile`, `CarouselTile`, `ActionRow`, `PrimaryCTA`).

---

## 11. Безопасность и Fail-Fast в Production

### 11.1. Fail-Fast в Production (`NODE_ENV=production`)
* При старте `config.ts` валидирует `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`. Если хотя бы одна переменная отсутствует или `JWT_SECRET === 'default_secret'` — процесс завершается с `process.exit(1)` без запуска слушателя портов.
* Файловый сторадж `db_store.json` жестко запрещен в продакшене. При недоступности пула Neon сервер отдает статус `503 DB_UNAVAILABLE`.

### 11.2. Защита от IDOR
* Каждый роут, принимающий `coupleId` или выполняющий операции над парой, проходит через middleware `requirePairOwnership`.
* Проверяется: `req.user.id === couple.userMaleId || req.user.id === couple.userFemaleId`. Доступ к чужим записям пресекается со статусом `403 FORBIDDEN`.

### 11.3. Серверный пересчет XP
* Клиентские запросы не могут напрямую передавать `level` или `xpPoints`. Роут `POST /api/couple/sync` принимает только факты совершенных действий, а пересчет очков и рангов происходит исключительно на сервере.

---

## 12. Метрики продукта и критерии успеха

* **Северная звезда (North Star Metric):** процент пар, ответивших минимум на 4 вопроса дня и завершивших хотя бы 1 совместный тест за первые 14 дней с момента связывания аккаунтов.
* **Индикаторы надежности системы:**
  * p95 задержки доставки касания через SSE: $< 350\text{ ms}$.
  * Скорость генерации детерминированного парного отчета: $< 150\text{ ms}$.
  * Доля успешных переподключений SSE при потере сети: $> 99\%$.

---

## 13. История изменений

| Дата | Версия | Изменения |
|---|---|---|
| 2026-09-08 | 0.1.0 | Первичный PRD: базовые P0 сценарии, связывание, SSE-концепция. |
| 2026-09-09 | 1.0.0 | Интеграция психометрической таксономии (ECR-R, BFI-20, Готтман, ЭФТ, Шварц). |
| 2026-09-09 | 2.0.0 | Реляционная схема Drizzle, транзакционный скоринг `for('update')`, декомпозиция контекстов React. |
| 2026-09-09 | 2.1.0 | Полная интеграция многомерной системы персон:<br>1. Срез 1: Роли контакта (Хранитель связи, Осторожный защитник, Осознанный архитектор).<br>2. Срез 2: Языки коммуникации (Интуитивный эмпат, Прагматичный логик, Сомневающийся искатель).<br>3. Срез 3: Конфликтная динамика (Взрывной контакт, Тихий омут, Несинхронные ритмы).<br>4. Адаптация онбординга и UX под снижение тревоги инициатора и снятие страха оценки у принимающего инвайт. |
| 2026-09-10 | 2.2.0 | Интеграция антиманипулятивной методологии и 2-уровневой пирамиды:<br>1. Антиманипулятивные форматы A (Ipsative Forced-Choice), B (Forced Vulnerability), C (Trade-off Matrix).<br>2. Полное удаление оценочных ярлыков и подсказок из вопросов.<br>3. 2-уровневая пирамида потока данных: Слой 1 (Сырые ответы `test_answers`) → Слой 2 (Личный профиль `user_psych_profiles`) → Барьер ожидания (`WAITING_FOR_PARTNER`) → Вершина пирамиды (Парный радар `couple_reports`).<br>4. Математика нелинейного штрафа для сфер идентичности и комплементарного баланса для сфер полярностей.<br>5. FSM-контракт интерфейса и семантическая сетка интерпретации процентов («Высокий резонанс», «Зона роста», «Точка рассинхрона»). |
