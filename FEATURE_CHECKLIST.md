# ✅ CHECKLIST: Добавление новой фичи

Используй этот чеклист при добавлении новой функциональности в проект.

---

## 📋 1. ПЛАНИРОВАНИЕ

### Определи слой FSD

- [ ] **Entity** - если это новая бизнес-сущность (данные + API)
- [ ] **Feature** - если это бизнес-фича (форма, модалка, действие)
- [ ] **Widget** - если это композитный UI блок (несколько фич + entities)

### Определи зависимости

- [ ] Какие entities нужны?
- [ ] Какие shared компоненты/хуки нужны?
- [ ] Нужна ли новая таблица в БД?
- [ ] Нужны ли новые API endpoints?

---

## 🗄️ 2. DATABASE (если нужна новая таблица)

### Supabase Migration

- [ ] Создай SQL миграцию в Supabase Dashboard
- [ ] Определи структуру таблицы (поля, типы, constraints)
- [ ] Добавь индексы (на FK, часто используемые поля)
- [ ] Настрой RLS (Row Level Security) политики
- [ ] Протестируй политики (попробуй получить чужие данные)

### Пример RLS политики

```sql
-- Пользователь видит только данные своего агентства
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );
```

---

## 📦 3. ENTITY (если новая сущность)

### Создай структуру

```
src/entities/[entity-name]/
├── api/
│   └── [entity]Api.ts      # RTK Query endpoints
├── lib/
│   └── types.ts            # TypeScript типы
├── slice/                  # Redux slice (опционально)
│   └── [entity]Slice.ts
└── ui/                     # UI компоненты сущности
    └── Empty[Entity].tsx   # Empty state
```

### Типы (lib/types.ts)

- [ ] Создай основной интерфейс сущности
- [ ] Создай типы для создания (`Create[Entity]Input`)
- [ ] Создай типы для обновления (`Update[Entity]Input`)
- [ ] Создай типы для удаления (`Delete[Entity]Arg`)
- [ ] Экспортируй все типы

### API (api/[entity]Api.ts)

- [ ] Импортируй `baseApi` и `supabase`
- [ ] Создай endpoints через `injectEndpoints`
- [ ] Добавь Query endpoints (GET)
  - [ ] Проверь авторизацию (`auth.getUser()`)
  - [ ] Добавь `providesTags` для кеширования
- [ ] Добавь Mutation endpoints (POST/PUT/DELETE)
  - [ ] Проверь авторизацию
  - [ ] Проверь доступ к ресурсу (agency_id)
  - [ ] Добавь `invalidatesTags` для обновления кеша
- [ ] Экспортируй хуки (`useGet[Entity]Query`, `useCreate[Entity]Mutation`)

### baseApi (shared/api/baseApi.ts)

- [ ] Добавь новый `tagType` в массив `tagTypes`

### Store (store/store.ts)

- [ ] Импортируй API: `import "@/src/entities/[entity]/api/[entity]Api"`
- [ ] Если нужен slice, добавь в `reducer`

---

## 🎨 4. FEATURE (если новая фича)

### Создай структуру

```
src/features/[feature-name]/
├── ui/                     # UI компоненты (опционально)
│   └── Form[Feature].tsx
├── lib/                    # Утилиты (опционально)
│   └── validation.ts
└── [Feature]Modal.tsx      # Главный компонент
```

### Компонент фичи

- [ ] Создай главный компонент (модалка/форма/действие)
- [ ] Используй хуки из entities (`useGet[Entity]Query`)
- [ ] Используй мутации (`useCreate[Entity]Mutation`)
- [ ] Добавь обработку ошибок
- [ ] Добавь loading состояния
- [ ] Добавь success feedback (toast/уведомление)

### Форма (если есть)

- [ ] Используй shadcn/ui компоненты
- [ ] Добавь валидацию (опционально: zod)
- [ ] Добавь disabled состояние при loading
- [ ] Добавь автофокус на первое поле

---

## 🧩 5. WIDGET (если композитный блок)

### Создай структуру

```
src/widgets/[widget-name]/
├── ui/                     # Подкомпоненты
│   ├── [Widget]Card.tsx
│   └── [Widget]Stats.tsx
└── [Widget].tsx            # Главный компонент
```

### Компонент виджета

- [ ] Композируй features и entities
- [ ] Добавь Empty State (если список)
- [ ] Добавь Loading State
- [ ] Добавь Error State (опционально)

---

## 📄 6. PAGE (если новая страница)

### Создай страничный компонент

```
src/page/[page-name]/
└── [Page]Page.tsx
```

- [ ] Используй виджеты
- [ ] Добавь защиту роута (auth guard)
- [ ] Добавь проверку agency_id (если нужно)

### Создай Next.js роут

```
src/app/[route]/
└── page.tsx
```

- [ ] Импортируй страничный компонент
- [ ] Добавь `"use client"` (если нужен)
- [ ] Добавь metadata (title, description)

---

## 🧭 7. NAVIGATION (если нужна в навбаре)

### Обнови навбар

- [ ] Добавь иконку в `src/shared/icons/NavIcons.tsx`
- [ ] Добавь пункт в `navItems` (`src/widgets/agency-navbar/AgencyNavbar.tsx`)
- [ ] Обнови `currentPage` логику
- [ ] Обнови `isShowing` условие

---

## 🎨 8. UI/UX

### Empty State

- [ ] Создай компонент `Empty[Entity].tsx`
- [ ] Добавь иконку (lucide-react)
- [ ] Добавь заголовок и описание
- [ ] Добавь CTA кнопку (если нужно)

### Loading State

- [ ] Используй `<Loading text="..." />`
- [ ] Или создай skeleton loader

### Error State

- [ ] Обработай ошибки API
- [ ] Покажи понятное сообщение пользователю
- [ ] Добавь кнопку "Попробовать снова"

### Success Feedback

- [ ] Добавь toast уведомление (опционально)
- [ ] Или покажи success message

---

## 🧪 9. TESTING (опционально)

### Ручное тестирование

- [ ] Создание сущности
- [ ] Чтение списка
- [ ] Обновление сущности
- [ ] Удаление сущности
- [ ] Проверка RLS (попытка доступа к чужим данным)
- [ ] Проверка на разных устройствах (mobile/desktop)

### Автоматическое тестирование (будущее)

- [ ] Unit тесты для утилит
- [ ] Integration тесты для API
- [ ] E2E тесты для критических флоу

---

## 📝 10. DOCUMENTATION

### Обнови документацию

- [ ] Добавь описание фичи в `CLAUDE.md` (секция "Текущий статус")
- [ ] Добавь пример кода в `CODE_EXAMPLES.md` (если нужно)
- [ ] Обнови `README.md` (если публичная фича)

### Комментарии в коде

- [ ] Добавь JSDoc для сложных функций
- [ ] Добавь TODO комментарии для будущих улучшений

---

## 🚀 11. DEPLOYMENT

### Перед коммитом

- [ ] Проверь линтер (`npm run lint`)
- [ ] Проверь TypeScript ошибки
- [ ] Удали console.log
- [ ] Удали закомментированный код
- [ ] Проверь, что всё работает локально

### Git

- [ ] Создай feature branch (`git checkout -b feature/[name]`)
- [ ] Сделай коммит с понятным сообщением
- [ ] Запуш в GitHub
- [ ] Создай Pull Request (если работаешь в команде)

### Vercel

- [ ] Проверь preview deployment
- [ ] Проверь production deployment

---

## 📊 12. MONITORING (после деплоя)

### Проверь в production

- [ ] Фича работает корректно
- [ ] Нет ошибок в консоли
- [ ] Нет ошибок в Supabase logs
- [ ] Performance нормальный (нет медленных запросов)

---

## 🎯 ПРИМЕР: Добавление фичи "Reports"

### 1. Планирование

- [x] Entity: `report` (новая сущность)
- [x] Feature: `create-report` (форма создания)
- [x] Widget: `agency-reports` (список отчётов)
- [x] Page: `/reports` (новая страница)

### 2. Database

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  agency_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Entity

- [x] `src/entities/report/lib/types.ts`
- [x] `src/entities/report/api/reportApi.ts`
- [x] `src/entities/report/ui/EmptyReports.tsx`

### 4. Feature

- [x] `src/features/create-report/CreateReportModal.tsx`
- [x] `src/features/create-report/FormReportCreate.tsx`

### 5. Widget

- [x] `src/widgets/agency-reports/AgencyReports.tsx`
- [x] `src/widgets/agency-reports/ui/ReportCard.tsx`

### 6. Page

- [x] `src/page/reports/ReportsPage.tsx`
- [x] `src/app/reports/page.tsx`

### 7. Navigation

- [x] Добавлен пункт "Reports" в навбар

### 8. Testing

- [x] Создание отчёта работает
- [x] Список отчётов отображается
- [x] RLS работает корректно

---

**Используй этот чеклист как шаблон для каждой новой фичи!**
