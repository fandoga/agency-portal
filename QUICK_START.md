# 🚀 QUICK START - Agency Client Portal

## Что это?

B2C SaaS для агентств — портал для прозрачной коммуникации с клиентами.

## Стек

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** (Auth + PostgreSQL)
- **Redux Toolkit** (RTK Query)
- **Tailwind CSS 4** + **shadcn/ui**

## Запуск

```bash
npm install
npm run dev  # ⚠️ Только webpack! Не turbopack!
```

## Архитектура (FSD)

```
src/
├── app/          # Next.js роуты
├── entities/     # Данные (profile, project, milestone, members)
├── features/     # Фичи (auth, create-project, invites)
├── widgets/      # UI блоки (navbar, projects, settings)
├── page/         # Страничные компоненты
├── shared/       # Утилиты, хуки, провайдеры
└── store/        # Redux store
```

## Основные сущности

- **Profile** (агентство) → **Project** → **Milestone** (задачи)
- **Members** (команда) + **Invites** (приглашения)

## Навигация

- `/auth` - Авторизация
- `/auth/choose-agency` - Выбор агентства
- `/agency?agency_id=uuid` - Главная (проекты)
- `/settings?agency_id=uuid` - Настройки
- `/invite/[token]` - Приглашение в команду

## Ключевые хуки

```typescript
const { session } = useAuth(); // Supabase session
const { agencies, session } = useGetAgencyData(); // Текущее агентство
const redirectParams = useRedirectParams(); // Навигация с params
```

## RTK Query Pattern

```typescript
// 1. Создай endpoint в entities/*/api/*Api.ts
export const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from("projects").select("*");
        if (error) return { error };
        return { data };
      },
      providesTags: ["Project"],
    }),
  }),
});

// 2. Используй в компоненте
const { data, isLoading } = useGetProjectsQuery();
```

## Важные нюансы

1. **Next.js 16** - новая версия, читай `node_modules/next/dist/docs/`
2. **Redux + SSR** - обязательно `dynamic = "force-dynamic"` + `await connection()`
3. **agency_id** - передаётся через URL query params
4. **share_token** - для доступа клиентов к проектам (генерируется автоматически)

## Что в разработке

- [ ] Отчёты (Reports) - **приоритет!**
- [ ] Share access для клиентов
- [ ] Drag & Drop задач
- [ ] Настройки команды

## Полная документация

См. `CLAUDE.md` для детальной информации.

---

**Версия:** 0.1.0 | **Статус:** 🚧 Active Development
