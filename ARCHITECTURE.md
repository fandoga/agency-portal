# 🏛️ АРХИТЕКТУРНЫЕ РЕШЕНИЯ

## 📐 Выбор архитектуры: Feature-Sliced Design (FSD)

### Почему FSD?

1. **Масштабируемость** - легко добавлять новые фичи без конфликтов
2. **Понятность** - чёткое разделение ответственности
3. **Переиспользование** - entities и shared используются везде
4. **Изоляция** - фичи не зависят друг от друга

### Слои FSD в проекте

```
app/       # Роутинг и композиция (Next.js App Router)
  ↓
page/      # Страничные компоненты (композиция widgets)
  ↓
widgets/   # Композитные UI блоки (используют features + entities)
  ↓
features/  # Бизнес-фичи (используют entities)
  ↓
entities/  # Бизнес-сущности (данные + API)
  ↓
shared/    # Общие утилиты, хуки, UI компоненты
```

### Правила зависимостей

- ✅ Верхние слои могут импортировать из нижних
- ❌ Нижние слои НЕ могут импортировать из верхних
- ❌ Слои одного уровня НЕ зависят друг от друга

---

## 🗄️ State Management: Redux Toolkit + RTK Query

### Почему Redux Toolkit?

1. **RTK Query** - встроенный data fetching с кешированием
2. **Автоматическая инвалидация** - через tagTypes
3. **TypeScript** - отличная типизация из коробки
4. **DevTools** - удобная отладка

### Почему НЕ React Query?

- RTK Query уже включён в Redux Toolkit
- Меньше зависимостей
- Единая экосистема для state + data fetching

### Структура store

```typescript
{
  api: {              // RTK Query (все API запросы)
    queries: {...},   // Кеш GET запросов
    mutations: {...}  // Кеш POST/PUT/DELETE
  },
  profile: {          // Redux slice (текущее агентство)
    currentAgency: Profile | null
  }
}
```

### Паттерн: queryFn + Supabase

Вместо стандартного `baseQuery` используем `fakeBaseQuery` + `queryFn`:

**Преимущества:**

- Прямой доступ к Supabase SDK
- Гибкость в запросах (joins, filters, RLS)
- Не нужен REST API слой
- Типизация из коробки

**Недостатки:**

- Больше boilerplate кода
- Нужно вручную обрабатывать ошибки

---

## 🔐 Backend: Supabase (BaaS)

### Почему Supabase?

1. **PostgreSQL** - мощная реляционная БД
2. **Auth из коробки** - email/password, OAuth, magic links
3. **Row Level Security (RLS)** - безопасность на уровне БД
4. **Realtime** - подписки на изменения (для будущего)
5. **Storage** - для файлов и логотипов
6. **Бесплатный tier** - для MVP

### Почему НЕ Firebase?

- PostgreSQL > NoSQL для реляционных данных
- RLS > Security Rules (более гибко)
- SQL > Firestore queries (привычнее)

### Почему НЕ собственный backend?

- Быстрее MVP
- Меньше инфраструктуры
- Встроенная авторизация
- Автоматическое масштабирование

---

## 🎨 UI: Tailwind CSS + shadcn/ui

### Почему Tailwind CSS?

1. **Utility-first** - быстрая разработка
2. **Кастомизация** - через CSS переменные
3. **Tree-shaking** - только используемые классы
4. **Responsive** - mobile-first из коробки

### Почему shadcn/ui?

1. **Copy-paste** - компоненты в твоём проекте (не npm пакет)
2. **Radix UI** - доступность из коробки
3. **Кастомизация** - полный контроль над кодом
4. **TypeScript** - отличная типизация

### Почему НЕ Material-UI / Ant Design?

- Слишком "тяжёлые" (bundle size)
- Сложная кастомизация
- Не Tailwind-friendly

---

## 🔄 Data Flow

### Получение данных (Query)

```
Component
  ↓ useGetProjectsQuery()
RTK Query
  ↓ queryFn
Supabase SDK
  ↓ SQL query
PostgreSQL
  ↓ RLS check
Return data
```

### Изменение данных (Mutation)

```
Component
  ↓ useCreateProjectMutation()
RTK Query
  ↓ queryFn
  ↓ auth.getUser() (проверка)
Supabase SDK
  ↓ INSERT query
PostgreSQL
  ↓ RLS check
  ↓ invalidatesTags: ["Project"]
RTK Query cache invalidation
  ↓ Автоматический refetch
Component re-render
```

---

## 🔐 Авторизация и безопасность

### Multi-layer Security

#### 1. Client-side (React)

```typescript
const { session } = useAuth();
if (!session) redirect("/auth");
```

**Цель:** UX (не показывать защищённые страницы)

#### 2. Supabase Auth

```typescript
const { data: userData } = await supabase.auth.getUser();
if (!userData.user) return { error: "Not authenticated" };
```

**Цель:** Проверка JWT токена

#### 3. Row Level Security (PostgreSQL)

```sql
CREATE POLICY "Users can view their agency projects"
  ON projects FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );
```

**Цель:** Защита на уровне БД (главная линия обороны)

### Почему RLS важен?

- Даже если клиент обойдёт React проверки
- Даже если украдут JWT токен
- RLS всё равно не даст доступ к чужим данным

---

## 🌐 Роутинг: Next.js App Router

### Почему App Router (не Pages Router)?

1. **Server Components** - меньше JS на клиенте
2. **Layouts** - переиспользование обёрток
3. **Loading/Error states** - встроенные
4. **Streaming** - постепенная загрузка

### Структура роутов

```
app/
├── layout.tsx              # Root layout (провайдеры)
├── page.tsx                # Главная (редирект)
├── auth/
│   ├── page.tsx           # Авторизация
│   └── choose-agency/
│       └── page.tsx       # Выбор агентства
├── agency/
│   └── page.tsx           # Главная агентства
├── settings/
│   ├── page.tsx           # Настройки
│   └── agency-settings/
│       └── page.tsx       # Настройки команды
└── invite/
    └── [id]/
        └── page.tsx       # Приглашение по токену
```

### Dynamic Routes

- `/invite/[id]` - динамический параметр (token)
- Query params - `?agency_id=uuid` (текущее агентство)

---

## 🎯 Multi-Agency Architecture

### Проблема

Пользователь может быть в нескольких агентствах (owner, admin, member).

### Решение: URL-based Agency Selection

```
/agency?agency_id=uuid-1  # Агентство 1
/agency?agency_id=uuid-2  # Агентство 2
```

### Почему URL, а не localStorage?

1. **Shareable links** - можно поделиться ссылкой
2. **Browser history** - работает кнопка "Назад"
3. **SSR-friendly** - можно читать на сервере
4. **No sync issues** - один источник правды

### Как работает?

```typescript
// 1. Получаем agency_id из URL
const searchParams = useSearchParams();
const agencyId = searchParams?.get("agency_id");

// 2. Фильтруем данные по agency_id
const projects = data?.filter((p) => p.agency_id === agencyId);

// 3. Навигация с сохранением agency_id
const redirectParams = useRedirectParams();
redirectParams("/settings"); // Сохранит ?agency_id=...
```

---

## 🔗 Share Token для клиентов

### Проблема

Клиент должен видеть проект, но НЕ должен иметь доступ к агентству.

### Решение: Public Share Token

```typescript
{
  id: "project-uuid",
  share_token: "random-uuid",  // Публичный токен
  agency_id: "agency-uuid"
}
```

### Как работает?

1. При создании проекта генерируется `share_token`
2. Ссылка для клиента: `/project/[share_token]`
3. Клиент видит только этот проект (без авторизации)
4. RLS политика: `WHERE share_token = $1`

### Безопасность

- ✅ Токен случайный (UUID v4)
- ✅ Нет доступа к другим проектам
- ✅ Можно отозвать (удалить/изменить токен)
- ✅ Read-only для клиента

---

## 📊 Кеширование и оптимизация

### RTK Query Cache

```typescript
providesTags: ["Project"]; // Помечаем данные тегом
invalidatesTags: ["Project"]; // Инвалидируем при изменении
```

**Преимущества:**

- Автоматический refetch после мутаций
- Дедупликация запросов
- Оптимистичные обновления (опционально)

### Supabase Realtime (будущее)

```typescript
supabase
  .channel("projects")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "projects" },
    (payload) => {
      // Автоматическое обновление UI
    },
  )
  .subscribe();
```

---

## 🚀 Performance

### Bundle Size Optimization

1. **Tree-shaking** - Tailwind CSS, Lucide icons
2. **Code splitting** - Next.js автоматически
3. **Dynamic imports** - для модалок и тяжёлых компонентов

### Database Optimization

1. **Индексы** - на `agency_id`, `project_id`, `status`
2. **Select specific fields** - не `SELECT *`
3. **Pagination** - для больших списков (будущее)

### Image Optimization

1. **Next.js Image** - автоматическая оптимизация
2. **Supabase Storage** - CDN для логотипов

---

## 🧪 Testing Strategy (будущее)

### Unit Tests

- Утилиты (`lib/utils.ts`)
- Хуки (`shared/hooks/`)
- Redux slices

### Integration Tests

- RTK Query endpoints
- Supabase queries

### E2E Tests

- Критические флоу (auth, create project)
- Cypress / Playwright

---

## 📦 Deployment: Vercel

### Почему Vercel?

1. **Next.js native** - создатели Next.js
2. **Zero config** - автоматический деплой
3. **Edge Functions** - быстрые API routes
4. **Preview deployments** - для каждого PR

### CI/CD

```
Git push → GitHub
  ↓
Vercel webhook
  ↓
Build (npm run build)
  ↓
Deploy to Edge
  ↓
Preview URL / Production
```

---

## 🔮 Будущие улучшения

### 1. Realtime Updates

- Supabase Realtime для live обновлений
- Показывать "Кто сейчас онлайн"

### 2. Optimistic Updates

- RTK Query optimistic updates
- Мгновенный UI feedback

### 3. Offline Support

- Service Worker
- IndexedDB для кеша

### 4. Analytics

- Posthog / Mixpanel
- Отслеживание действий пользователей

### 5. Email Notifications

- Supabase Edge Functions
- Resend / SendGrid

---

## 📚 Ресурсы

- [Feature-Sliced Design](https://feature-sliced.design/)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Последнее обновление:** 2026-04-25
