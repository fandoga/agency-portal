# 🎯 Agency Client Portal - Руководство для разработки

## 📋 О проекте

**Тип:** B2C SaaS для маркетинговых агентств  
**Цель:** Прозрачная коммуникация между агентством и клиентом через портал с проектами, задачами и отчётами

## 📚 Документация

- **[DATABASE.md](./DATABASE.md)** - Схема БД, RLS, RPC функции (читай первым!)
- **[CODE_EXAMPLES.md](./CODE_EXAMPLES.md)** - Примеры кода для Entity/Feature/Widget
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Архитектурные решения
- **[FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md)** - Чеклист добавления фич

## 🏗️ Технологический стек

- **Next.js 16.2.0** (App Router) ⚠️ Новая версия с breaking changes
- **React 19.2.4** + **TypeScript 5.x**
- **Tailwind CSS 4.x** + **shadcn/ui**
- **Redux Toolkit** (RTK Query)
- **Supabase** (PostgreSQL + Auth)
- **Webpack** (используй `npm run dev`, не turbopack!)

## 📁 Архитектура (FSD)

```
src/
├── app/                    # Next.js роуты
│   ├── layout.tsx         # Root layout с провайдерами
│   ├── Provider.tsx       # Auth, Redux, DnD провайдеры
│   ├── auth/              # Авторизация
│   ├── agency/            # Главная страница
│   ├── settings/          # Настройки
│   └── invite/[id]/       # Приглашения
│
├── entities/              # Бизнес-сущности
│   ├── profile/           # Агентства (api/, lib/types.ts, slice/, ui/)
│   ├── project/           # Проекты
│   ├── milestone/         # Задачи
│   └── members/           # Команда
│
├── features/              # Фичи
│   ├── auth/             # Формы входа/регистрации
│   ├── agencies/         # Создание агентства
│   ├── projects/         # Создание проектов/задач
│   └── agency-invite/    # Приглашения
│
├── widgets/               # Композитные блоки
│   ├── agency-navbar/    # Навбар
│   ├── agency-projects/  # Список проектов
│   └── agency-settings/  # Настройки
│
├── page/                  # Страничные компоненты
├── shared/                # Утилиты, хуки, UI
│   ├── api/baseApi.ts    # RTK Query base
│   ├── api/supabase/     # Supabase клиент
│   └── hooks/            # useAuth, useRedirectParams, etc.
└── store/                 # Redux store
```

## 🗄️ База данных (краткая справка)

**Полная документация:** [DATABASE.md](./DATABASE.md)

### Иерархия таблиц

```
auth.users (Supabase Auth)
    ↓
profiles (Агентства)
    ↓
    ├── projects (Проекты)
    │   ↓
    │   ├── milestones (Задачи)
    │   └── reports (Отчёты) ⚠️ RLS отключён!
    │
    ├── agency_members (Команда: owner/admin/member)
    └── invites (Приглашения)
```

### Основные таблицы

**profiles** (Агентства)

```typescript
{
  id: string (uuid, = auth.uid())
  user_id: string (FK -> auth.users)
  agency_name: string
  website_url: string
  logo_url: string
}
```

**projects** (Проекты)

```typescript
{
  id: string (uuid)
  agency_id: string (FK -> profiles.id)
  name: string
  description: string | null
  status: 'in_progress' | 'active' | 'wait_review' | 'paused' | 'completed'
  share_token: string (uuid) // Для клиентского доступа
}
```

**milestones** (Задачи)

```typescript
{
  id: string (uuid)
  project_id: string (FK -> projects.id)
  name: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  due_date: date | null
  completed_at: timestamp | null
}
```

**agency_members** (Команда)

```typescript
{
  id: string (uuid)
  agency_id: string (FK -> profiles.id)
  user_id: string (FK -> auth.users)
  role: 'owner' | 'admin' | 'member'
  agency_name: string | null
}
```

**invites** (Приглашения)

```typescript
{
  id: string (uuid)
  agency_id: string (FK -> profiles.id)
  role: 'owner' | 'admin' | 'member'
  token: string (uuid, unique)
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
}
```

### RPC функции

- `get_agency_members_with_email(ag_id UUID)` - Члены команды с email
- `get_invite_by_token(p_token UUID)` - Данные приглашения
- `accept_agency_invite(p_token UUID, p_user_id UUID, p_role TEXT?)` - Принятие инвайта

### Триггеры

- `set_profiles_id_to_auth_uid()` - Устанавливает `id = auth.uid()` при создании профиля
- `handle_new_profile_agency_member()` - Создаёт запись в `agency_members` с ролью `owner`

### ⚠️ Безопасность

- **RLS включён:** profiles, projects, milestones, agency_members, invites
- **RLS отключён:** reports (критичная проблема!)

## 🔐 Аутентификация

### Auth Flow

1. Supabase Auth (email/password)
2. AuthProvider хранит session в Context
3. Доступ через `useAuth()` хук
4. Multi-agency: выбор через `/auth/choose-agency`

### Защита роутов

```typescript
const { session } = useAuth();
if (!session) redirect("/auth");
```

### Система приглашений

1. Генерация `token` (uuid)
2. Ссылка: `/invite/[token]`
3. Принятие → запись в `agency_members`

## 🔄 State Management

### Redux Store

```typescript
{
  api: {
    queries: { ... },    // RTK Query cache
    mutations: { ... }
  },
  profile: {
    currentAgency: Profile | null
  }
}
```

### RTK Query Endpoints

**profileApi:**

- `createNewProfile`, `getAgency`, `deleteProfile`

**projectApi:**

- `getAgencyProjects`, `getProjectByToken`, `createNewProject`, `deleteProject`

**milestoneApi:**

- `createNewMilestone`, `deleteMilestone`

**membersApi:**

- `getInviteByToken`, `createMemberInvite`, `acceptInvite`

### Cache Invalidation

Используй **tagTypes** для автообновления:

- `Profile`, `Project`, `Milestone`, `Members`

## 🎨 UI/UX

### Навигация (Bottom Navbar)

```typescript
const navItems = [
  { id: "home", href: "/agency" }, // Проекты
  { id: "reports", href: "/agency" }, // Отчёты (TODO)
  { id: "clients", href: "/agency" }, // Клиенты (TODO)
  { id: "settings", href: "/settings" }, // Настройки
];
```

### Роуты

```
/                           # Редирект
/auth                       # Авторизация
/auth/choose-agency         # Выбор агентства
/agency?agency_id=uuid      # Главная
/settings?agency_id=uuid    # Настройки
/invite/[token]             # Приглашение
```

### Компоненты shadcn/ui

```
components/ui/
├── button.tsx, card.tsx, dialog.tsx
├── input.tsx, select.tsx, label.tsx
├── badge.tsx, avatar.tsx, progress.tsx
├── empty.tsx, spinner.tsx, tooltip.tsx
└── accordion.tsx, alert-dialog.tsx, separator.tsx
```

## 🛠️ Паттерны кода

### Custom Hook для данных агентства

```typescript
export const useGetAgencyData = () => {
  const searchParams = useSearchParams();
  const { session: authSession } = useAuth();
  const { data, isLoading } = useGetAgencyQuery(authSession?.user?.id);

  const selectedAgencyId = searchParams?.get("agency_id");
  const session = data?.find((agency) => agency.id === selectedAgencyId);

  return { agencies: data, session, isLoading, selectedAgencyId };
};
```

### RTK Query с Supabase

```typescript
createNewProject: build.mutation<Project, createProjectType>({
  queryFn: async ({ agency_id, name, description, status }) => {
    // 1. Проверка авторизации
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return { error: userErr };

    // 2. Генерация ID и токенов
    const id = crypto.randomUUID();
    const share_token = crypto.randomUUID();

    // 3. Вставка данных
    const { data, error } = await supabase
      .from("projects")
      .insert({ id, agency_id, name, description, status, share_token })
      .single();

    if (error) return { error };
    return { data };
  },
  invalidatesTags: ["Project"],
}),
```

### Редирект с query params

```typescript
const redirectParams = useRedirectParams();
redirectParams("/agency"); // Сохранит ?agency_id=...
```

### Empty States

```typescript
{data?.length > 0 ? (
  <AgencyProjects data={data} />
) : (
  <EmptyProjects />
)}
```

## ⚠️ Важные особенности

### Next.js 16 Breaking Changes

```typescript
// В layout.tsx обязательно:
export const dynamic = "force-dynamic";

// И в функции:
await connection(); // Для динамического рендера
```

### React-Redux Duplicate Issue

В `next.config.ts` настроены алиасы. **Всегда используй:** `npm run dev` (не `dev:turbo`)

### Supabase Client-Side Only

```typescript
// src/shared/api/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
```

### URL Parameters для Agency ID

```typescript
const searchParams = useSearchParams();
const agencyId = searchParams?.get("agency_id");
```

## 🚀 Текущий статус

### ✅ Реализовано

- Авторизация (Supabase Auth)
- Создание агентства
- Multi-agency (выбор агентства)
- Создание проектов и задач
- Система приглашений
- Нижний навбар
- Список проектов с карточками

### 🚧 В разработке

- Отчёты (Reports) - папки созданы: `src/features/create-report/`, `src/entities/report/`
- Управление клиентами (Clients)
- Share Token для клиентов - папка: `src/features/share-access/`
- Drag & Drop для задач (библиотека установлена: `@dnd-kit/react`)
- Настройки команды (UI создан, функционал не реализован)

## 🛠️ Команды

```bash
npm run dev # Не использовать
npm run build    # Сборка и проверка билда
npm run lint     # Линтинг
```

## 📝 Соглашения

### Naming

- Компоненты: PascalCase (`AgencyNavbar.tsx`)
- Хуки: camelCase с `use` (`useGetAgencyData`)
- Типы: PascalCase (`Profile`, `Project`)
- API endpoints: camelCase (`createNewProfile`)

### File Structure

- **Entities:** `api/`, `lib/types.ts`, `slice/`, `ui/`
- **Features:** `ui/`, `lib/`, `api/`
- **Widgets:** `ui/` + основной файл в корне

### TypeScript

- Всегда типизируй props
- `interface` для объектов
- `type` для union types

### Styling

- Tailwind CSS классы
- CSS переменные для цветов (`--brand-*`)
- Mobile-first подход

## 🔍 Полезные хуки

```typescript
// Данные агентства
const { session, agencies, isLoading } = useGetAgencyData();

// Редирект с query params
const redirectParams = useRedirectParams();

// Auth
const { session } = useAuth();

// Redux
const dispatch = useAppDispatch();
const state = useAppSelector((state) => state.profile);

// Tailwind merge
import { cn } from "@/lib/utils";
```

## 🐛 Debugging

### Redux DevTools

F12 → Redux вкладка

### Supabase Logs

```typescript
const { data, error } = await supabase.from("projects").select("*");
console.log({ data, error });
```

### Common Errors

- **"Invalid hook call"** → Используй webpack (`npm run dev`)
- **"Not authenticated"** → Проверь session через `useAuth()`
- **"Проект не найден"** → Проверь `agency_id` в URL и RLS

## 📦 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

## ⚠️ Критичные моменты

1. **База данных**
   - ❌ Таблица `reports` БЕЗ RLS - включить срочно!
   - ✅ Остальные таблицы защищены RLS
   - 🔧 5 RPC функций + 2 триггера

2. **Next.js 16**
   - Обязательно: `dynamic = "force-dynamic"` + `await connection()`
   - Используй только webpack: `npm run dev`

3. **Multi-Agency**
   - `agency_id` передаётся через URL query params
   - Используй `useGetAgencyData()` для текущего агентства

4. **Security**
   - 3 уровня: Client (React) → Supabase Auth → RLS (PostgreSQL)
   - RLS - главная линия обороны
   - Публичный доступ только по токенам

## 📋 Чеклист перед работой

- [ ] Прочитал [DATABASE.md](./DATABASE.md)
- [ ] Знаю про проблему с RLS на `reports`
- [ ] Понимаю иерархию: profiles → projects → milestones
- [ ] Знаю про RPC функции и триггеры
- [ ] Понимаю Multi-Agency (agency_id в URL)
- [ ] Знаю про share_token для клиентов
- [ ] Понимаю роли: owner > admin > member
- [ ] Знаю особенности Next.js 16
- [ ] Понимаю FSD архитектуру
- [ ] Знаю где искать примеры ([CODE_EXAMPLES.md](./CODE_EXAMPLES.md))
