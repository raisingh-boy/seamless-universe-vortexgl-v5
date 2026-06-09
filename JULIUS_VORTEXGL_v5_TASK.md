# 🧬 JULIUS: VORTEXGL v5 — ПОЛНАЯ АРХИТЕКТУРА И ЗАДАЧИ

## ⚠️ ПЕРВОЕ — Изучить

Прочитай этот документ ПОЛНОСТЬЮ перед любым кодом.
Не пиши код пока не поймёшь всю картину.

---

## ЧАСТЬ 0. ФИЛОСОФИЯ ПРОЕКТА

**Seamless Universe** — живая карта смыслов.
НЕ соцсеть. НЕ форум. НЕ Wikipedia. НЕ Notion.

**Единица ценности** — не пост, не лайк, не подписчик.
Единица ценности — СМЫСЛ (нода) и СВЯЗЬ (ребро).

Смыслы не хранятся. Они ЖИВУТ.
Каждое действие пользователя меняет видимость идеи в 3D пространстве.

### Запрещено реализовывать
✗ Лайки, стрики, бейджи, лидерборды, уровни, очки опыта
✗ NFT / крипта / токены
✗ Подписки на людей

### Разрешено и обязательно
✓ Эволюция нод (seed → atlas)
✓ 4 действия с разным весом
✓ Decay — угасание неактивных идей
✓ Репутация по 4 осям (характер, не рейтинг)
✓ Восхождение в Атлас как редкое событие

---

## ЧАСТЬ 1. АРХИТЕКТУРА — ТРИ МИРА

Три мира — это НЕ три базы данных.
Это три ПРОЕКЦИИ (фильтра) над одной базой:

```
ЕДИНАЯ БАЗА (nodes[] + edges[] + events[] + stories[] + audio[])
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
 АТЛАС   ПОЛЕ    Я
```

### 1.1 АТЛАС (Canon Universe)
Верифицированное знание. world: 'atlas'. Пополняется вручную.
Ноды группируются по 6 доменам как созвездия.

### 1.2 ПОЛЕ (Community Universe)
Живое пространство сообщества.
- Режим IDEAS: граф пользовательских нод (world: 'field')
- Режим PEOPLE: граф людей (каждый пользователь = звезда)
- Атласные ноды показываются полупрозрачно если есть ребро к field-ноде

### 1.3 МОЙ МИР (My World / Personal Universe)
- Приватные ноды, черновики, личные заметки
- Организация по Dilts Logical Levels (Z-ось)
- Только для авторизованного пользователя

### Переключение миров
Нижняя навигация: [🌌 АТЛАС] [👥 COMMUNITY] [🧬 MY WORLD]
В COMMUNITY: дополнительный переключатель [💡 IDEAS] [👥 PEOPLE]

Инструменты адаптируются под мир:
- АТЛАС: фильтр по домену, хронология, overlay исследователя, визуальный режим
- COMMUNITY IDEAS: сортировка (новые/популярные/восходящие), статус, кнопка [+]
- COMMUNITY PEOPLE: поиск, созвездия, "найти похожих"
- MY WORLD: приватность, черновики, наложение графа другого пользователя

---

## ЧАСТЬ 2. ТИПОЛОГИЯ НОД

### Типы (NodeType)
concept / practice / person / movement / event / observation / project / draft

### Уровни (NodeLevel)
macro — широкая концепция (эпоха, наука)
meso — конкретный человек, метод
micro — деталь, инструмент

### Домены (Domain)
body / science / philosophy / movement / cognition / hybrid

### Полная схема ноды
```typescript
interface SomaticNode {
  id: string
  type: NodeType
  level: NodeLevel
  domain: Domain
  world: 'atlas' | 'field' | 'personal'
  status: NodeStatus  // 'seed' | 'sprout' | 'alive' | 'rooted'
  name_ru: string
  name_en: string
  desc_ru?: string
  desc_en?: string
  resonances: number
  connections: number
  carries: number
  stories_count: number
  added_by?: string
  is_private: boolean
  last_active_at: number
}
```

### Эволюция ноды (жизненный цикл)
```
SEED    (score 0-9)    — только родилась
SPROUT  (score 10-49)  — начинает жить
ALIVE   (score 50-99)  — активна
ROOTED  (score 100+)   — укоренилась
ATLAS   (верификация)  — ручной промоушен командой
```

**Формула score:**
```
score = resonances × 1.0 + connections × 5.0 + carries × 3.0
```

---

## ЧАСТЬ 3. ЧЕТЫРЕ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ

### 3.1 Резонанс (♦)
- "Эта идея звучит со мной"
- Вес +1 к score ноды
- Можно 1 раз на ноду

### 3.2 Связь (⟷)
- Соединить две ноды ребром
- Вес +5 к score (тяжёлое действие)
- Вес +1 reputation_connector автору

### 3.3 Нести (↗)
- "Беру эту идею с собой в другой мир"
- Пользовательская копия в MY WORLD
- Вес +3 к score оригинала
- Исходная нода не дублируется

### 3.4 История (+)
- Написать нарратив о связи двух концептов
- Привязан к РЕБРУ (не к ноде!)
- Вес: +1 к score каждой из двух нод

### Репутация по 4 осям
- EXPLORER: исследовал 20+ уникальных концептов
- BUILDER: создал 5+ нод в Поле
- CONNECTOR: построил 10+ рёбер
- STORYTELLER: написал 3+ истории

### Decay (угасание)
Каждые 7 дней без активности — score -= max(1, score × 0.1)
Уведомление за 2 дня до: "Идея угасает — резонируй чтобы сохранить"

### Concept Health
```
Health = { Resonance, Trust, Growth }
Growth = резонансы за 7 дней / всего резонансов
```

---

## ЧАСТЬ 4. СВЯЗИ И ИСТОРИИ

### Типы рёбер (EdgeType)
conceptual / historical / practical / resonance / opposition

### Ключевое решение
Истории привязаны к РЁБРАМ (пересечение двух концептов), а не к нодам.
Пример: история "Паули и Юнг создали синхроничность" → ребру physics → psychotherapy

### Схема ребра
```typescript
interface Edge {
  id: string
  source: string
  target: string
  type: EdgeType
  world: 'atlas' | 'field'
  labelRu?: string
  labelEn?: string
  resonanceWeight: number  // 1-10
  activity: number
  addedBy?: string
  storyIds: string[]
}
```

---

## ЧАСТЬ 5. КАРТОЧКА НОДЫ (NodeCard)

Шторка снизу, 80% высоты. Граф на фоне продолжает дышать.
Четыре вкладки:

**[СУТЬ]**
Название + домен + статус badge + автор + описание
"Пересекается с:" — кликабельные ноды

**[ИСТОРИИ]**
Нарративы всех рёбер ноды, сортировка по резонансам
Кнопка "+ Написать историю"

**[КАРТА] (MindMap)**
Маленький Canvas: нода в центре, связи 1-2 уровня
Интерактивный: тап → рецентрирование

**[МАТЕРИАЛЫ]**
Статьи, ссылки, аудио треки

Нижняя часть (всегда видна):
[♦ Резонирую] [⟷ Связать] [↗ Нести] [+ История]

---

## ЧАСТЬ 6. ВИЗУАЛЬНЫЕ РЕЖИМЫ

🎨 Colour — цвета доменов
⬜ Mono — монохром (CSS grayscale)
⛶ Cinematic — fullscreen + autoRotate + bloom × 2 + скрыть UI

---

## ЧАСТЬ 7. БАЗА ДАННЫХ — ПОЛНАЯ СХЕМА

### Таблицы (PostgreSQL)

1. **nodes** — все ноды (id, type, level, domain, world, status, name_ru/en, desc_ru/en, resonances, connections, carries, stories_count, added_by, is_private, last_active_at, created_at)

2. **edges** — рёбра (id, source_id → nodes, target_id → nodes, type, world, label_ru/en, resonance_weight, activity, added_by, created_at)

3. **stories** — истории (id, edge_id → edges, title_ru/en, text_ru/en, figure_a/b, year, source_url, author_id, resonances, verified, created_at)

4. **articles** — статьи (id, node_id, title, summary, source_url, year, type)

5. **audio_tracks** — аудиотреки (id, title_ru/en, duration, audio_url, domain)

6. **audio_node_timestamps** — таймкоды нод (track_id, node_id, time_ms, caption)

7. **audio_edge_timestamps** — таймкоды рёбер (track_id, edge_id, time_ms, caption)

8. **users** — пользователи (id, name, email, reputation_score + 4 оси, privacy_graph, privacy_resonances)

9. **user_events** — лог событий (id, type, actor_id, object_id, target_id, weight, world, timestamp)

10. **user_node_relations** — персональные отношения (user_id, node_id, resonated, carried, followed)

11. **drafts** — черновики (id, user_id, title, content, domain, status)

---

## ЧАСТЬ 8. AI LAYER (для будущего, заложить в модель)

### Цикл день/ночь
ДЕНЬ — пользователи создают: инсайты, заметки, идеи, связи
НОЧЬ (00:00) — AI:
1. Новые инсайты → summary + related concepts
2. Голос → STT → summary → embedding → граф
3. Поиск новых связей между нодами
4. Поиск похожих людей
5. Обнаружение потенциальных созвездий

### Очередь предложений
> 95% confidence → авто-публикация
60-90% → человеку на approve/reject/edit
< 60% → discard

### Insight — единица мышления
Короткая мысль (голосом или текстом).
AI кластеризует 1000 инсайтов → новые Concepts.

---

## ЧАСТЬ 9. ОНБОРДИНГ

Принцип: aha-момент ДО регистрации.

Шаг 1: Сразу видит живой 3D граф. Без стены регистрации.
Шаг 2: Анонимное исследование (readonly).
Шаг 3: При действии → мягкая просьба войти (Google OAuth).

---

## ЧАСТЬ 10. ЗАДАЧИ ПО ВЕКТОРАМ РАЗРАБОТКИ

Ниже задачи сгруппированы по направлениям.
Каждое направление — отдельный поток работы.
Порядок внутри направления = приоритет.

---

### 🟣 ВЕКТОР A: ГРАФИКА (VortexGL Engine)

**Файл:** `src/components/MyceliumGraph.tsx` (1784 строки — НЕ трогать структуру, только добавлять/расширять)

**A1. Эволюция нод — визуализация статуса**
- SEED: пульсация каждые 3s + маленький радиус (0.3)
- SPROUT: свечение умеренное, радиус 0.5
- ALIVE: сильное свечение, радиус 0.7
- ROOTED: постоянная аура, радиус 1.0, тонкие лучи
- ATLAS: как ROOTED + внешнее кольцо + звёздные частицы
- Цвет обводки / glow зависит от статуса
- При достижении 100 резонансов → вспышка + анимация "ascension"

**A2. Три мира — три визуальных режима**
- ATLAS: доменные цвета (E8A95C / 5C9BE8 / 9B5CE8 / 5CE87A / EAEAEA / E85C7A)
- FIELD IDEAS: сине-зелёный (#5CE8C8) вместо доменных цветов + мерцание seed
- FIELD PEOPLE: каждый пользователь = звезда, цвет = домен, размер = Trust × Contribution
- MY WORLD: Z-ось по Dilts Logical Levels
- Морфинг-анимация при переключении мира

**A3. Созвездия (Constellations)**
- Группировка нод в созвездия по доменам
- Визуальный контур вокруг группы (линия)
- При клике на созвездие: зум на группу + заголовок
- Авто-обнаружение плотных кластеров

**A4. Procedural текстуры сфер**
- Canvas2D → THREE.CanvasTexture
- Каждая сфера → random seed → уникальная текстура
- Шум Перлина + звёздные точки
- На hover: текстура вращается
- На резонансе: короткая вспышка

**A5. Cinematic mode**
- Fullscreen + autoRotate + bloom × 2
- Скрыть весь UI кроме минимального branding
- Замедленная камера с плавными движениями

**A6. Wormhole-переходы**
- Анимация при клике на ноду: камера влетает в ноду
- Через 1.5s: карточка ноды
- При смене мира: эффект туннеля (zoom out → zoom in)

**A7. MindMap (внутри NodeCard)**
- Маленький отдельный Canvas в табе [КАРТА]
- Нода в центре, связи 1-2 уровня
- Интерактивный: тап → рецентрирование

**A8. Звук сфер (Web Audio API)**
- Каждая сфера — OscillatorNode
- macro: 80-150Hz, meso: 200-400Hz, micro: 500-800Hz
- body→sine, philosophy→triangle, movement→sawtooth, science→square
- На hover: gain 0→0.03
- Кнопка 🔊 в header

**A9. Live Graph**
- При воспроизведении аудио: подсветка нод по таймкодам
- activeAudioNodeId → сфера пульсирует
- При обсуждении связи: ребро подсвечивается

---

### 🟠 ВЕКТОР B: ИНТЕРФЕЙС (UI)

**Файлы:** `src/App.tsx`, все компоненты в `src/components/`

**B1. Архитектура трёх миров в App.tsx**
- Переключение миров меняет:
  - Фильтры (world: 'atlas' | 'field' | 'personal')
  - Доступные инструменты
  - Визуальный режим графа
  - Данные на панелях
- При переключении: морфинг-анимация графа (2s)

**B2. NodeCard — float панель (НЕ шторка)**
- Позиция: справа (десктоп 30-40%), снизу (мобильные 60-70%)
- z-index выше графа, НО ниже footer с [+]
- max-height: 85vh, overflow-y: auto
- Backdrop: rgba(0,0,0,0.6), click outside → close
- Анимация: slide-in-right 0.3s (десктоп), slide-up 0.3s (мобильные)
- 4 таба: [СУТЬ] [ИСТОРИИ] [КАРТА] [МАТЕРИАЛЫ]
- Нижняя панель действий: [♦ Резонирую] [⟷ Связать] [↗ Нести] [+ История]

**B3. AddSenseModal — центральный модал**
- Центр экрана, z-9999
- Backdrop: click outside = close
- Анимация: fade-in + scale 0.25s
- Форма: название, описание, категория, AI-парсинг (плейсхолдер)
- Кнопки: [Отмена] [Добавить]

**B4. Filter Shelf**
- Выдвижная полка под header (slide-down 0.25s)
- Чипсы: домены, эпоха, слой (macro/meso/micro)
- Активные фильтры подсвечены
- Закрывается по ✕ или клик вне

**B5. Эволюция UI — отображение score и статуса**
- Прогресс-бар статуса в NodeCard
- +X score всплывает при каждом действии (анимация)
- Concept Health: Resonance / Trust / Growth

**B6. Profile Panel**
- Аватары резонировавших (6 макс + счётчик)
- Репутация по 4 осям
- Личные ноды, история действий

**B7. CommunityAgenda**
- Ежедневный вопрос сообщества
- Голосование, обсуждение
- Архив прошлых вопросов

**B8. Onboarding (первые 5 минут)**
- Шаг 1: живой граф сразу, без регистрации
- Шаг 2: анонимное исследование
- Шаг 3: мягкая регистрация при первом действии

**B9. Визуальные режимы — UI**
- Кнопка в header → выпадающее меню: [🎨 Colour] [⬜ Mono] [⛶ Cinematic]
- При смене: плавный переход

**B10. Mobile адаптация**
- safe-area-inset-bottom
- Компактные иконки миров без текста
- Bottom bar не перекрыт NodeCard
- [+] всегда видна

---

### 🟢 ВЕКТОР C: ЗВУК (Audio System)

**Файлы:** `src/components/AudioPlayer.tsx`, аудио-сервер

**C1. Mini Audio Player**
- Маленькая плашка, 40px высотой
- Позиция: внизу слева, над bottom bar
- Элементы: [▶/⏸] Название трека ⏱ 12:34
- Никогда не наезжает на [+]

**C2. Full Audio Player**
- Разворачивается свайпом вверх / кликом
- Реальное аудио через HTMLAudioElement
- Прогресс-бар с таймкодами нод (цветные точки = домен)
- Тап на точку → карточка ноды
- Демо-режим (setInterval) если нет файла
- "⚠ Demo mode" в UI

**C3. Таймкоды**
- audio_node_timestamps: track_id + node_id + time_ms + caption
- audio_edge_timestamps: track_id + edge_id + time_ms + caption
- При воспроизведении: подсветка в графе

**C4. Аудио файлы**
- Реальные: /public/audio/*.mp3
- В AudioTrack: audioUrl: '/audio/bateson-lecture.mp3'
- Если файла нет → демо-режим

---

### 🔵 ВЕКТОР D: ДАННЫЕ И СВЯЗИ (Backend/API)

**D1. API endpoints**
```
GET  /api/nodes?world=atlas&domain=body&level=macro
GET  /api/nodes/:id
GET  /api/edges?source=:id&target=:id
GET  /api/stories?node=:id
GET  /api/search?q=:query
POST /api/auth/google
POST /api/nodes          (создать ноду)
POST /api/edges          (создать ребро)
POST /api/resonate       (резонанс)
POST /api/carry          (нести)
POST /api/stories        (написать историю)
GET  /api/user/:id/profile
GET  /api/user/:id/activity
```

**D2. Database (PostgreSQL)**
Создать все таблицы из Части 7.
Миграции через knex или prisma.

**D3. Google OAuth**
Авторизация через Google.
JWT токены.
Анонимный readonly доступ.

**D4. Event Sourcing**
Все действия пишутся в user_events.
События: resonate / connect / carry / story / add_node / add_edge / follow

**D5. Decay (cron)**
Каждые 24h: проверка нод без активности 7+ дней
Уменьшение score
Уведомление за 2 дня

**D6. Созвездия (алгоритм)**
Обнаружение кластеров по плотности связей
Авто-именование по общему домену

---

### 🟡 ВЕКТОР E: AI LAYER (отдельный сервис)

**E1. Очередь предложений (Night Cycle)**
- 00:00 запуск
  - Новые инсайты → summary + related
  - Голос → STT → embedding → граф
  - Поиск новых связей между нодами
  - Поиск похожих людей
  - Потенциальные созвездия
- Confidence: >95% авто, 60-90% на approve, <60% discard

**E2. Insight Engine**
- Приём коротких мыслей (текст/голос)
- Кластеризация → новые Concepts
- Embedding + semantic search

**E3. AI Suggestions API**
```
POST /api/ai/suggest
POST /api/ai/approve/:suggestionId
POST /api/ai/reject/:suggestionId
GET  /api/ai/pending-suggestions
```

---

## СТРУКТУРА ПРОЕКТА

```
vortexgl-v5/
├── src/
│   ├── App.tsx                  # Главное приложение (1795 строк)
│   ├── main.tsx                 # Точка входа
│   ├── index.css                # Стили
│   ├── types.ts                 # Все типы
│   ├── data/
│   │   └── nodesData.ts         # Данные нод
│   ├── components/
│   │   ├── MyceliumGraph.tsx    # ⭐ VortexGL движок (1784 строки)
│   │   ├── Onboarding.tsx       # Онбординг
│   │   ├── ConceptDetails.tsx   # Детали концепта
│   │   ├── AddSenseModal.tsx    # Добавление ноды
│   │   ├── CommunityAgenda.tsx  # Ежедневный вопрос
│   │   └── UserProfile.tsx      # Профиль пользователя
│   └── ...
├── public/
│   └── audio/                   # Аудиофайлы .mp3
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## ТЕХСТЕК

- **Frontend:** React 18 + Vite + TypeScript
- **3D:** Three.js + @react-three/fiber + @react-three/drei
- **UI:** Tailwind CSS + Framer Motion
- **Icons:** lucide-react
- **Backend:** Node.js + Express
- **DB:** PostgreSQL
- **Auth:** Google OAuth (JWT)
- **AI:** Gemini API / OpenAI API

---

## КОМАНДЫ

```bash
# Разработка
npm install
npm run dev          # → localhost:3000

# Сборка
npm run build        # → dist/

# Деплой
scp -r dist/* user@server:/var/www/universe/
```

---

## ПРИОРИТЕТЫ

### 🔴 P0 — СЕЙЧАС
- B2: NodeCard float-панель (НЕ шторка)
- B4: Filter Shelf
- C1: Mini Audio Player
- B3: AddSenseModal — центральный модал

### 🟡 P1 — В ЭТОМ СПРИНТЕ
- A1: Эволюция нод — визуализация статуса
- B1: Архитектура трёх миров
- B10: Mobile адаптация
- D1: API endpoints

### 🟢 P2 — СЛЕДУЮЩИЙ СПРИНТ
- A2: Три визуальных режима
- A3: Созвездия
- C2: Full Audio Player
- D2-D4: База, OAuth, Event Sourcing

### 🔵 P3 — БУДУЩЕЕ
- E1-E3: AI Layer
- A5-A8: Cinematic, Wormhole, MindMap, Звук сфер
- A9: Live Graph
- D5-D6: Decay, Constellations
