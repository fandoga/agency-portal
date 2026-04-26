# 🎯 Agency Client Portal

B2C SaaS приложение для маркетинговых агентств, студий разработки и фриланс-команд.

## 📚 Документация

### Быстрый старт

- **[QUICK_START.md](./QUICK_START.md)** - Быстрый старт для разработки (5 мин)

### Глубокое понимание

- **[CLAUDE.md](./CLAUDE.md)** - Полная инструкция для AI ассистента (30 мин)
- **[DATABASE.md](./DATABASE.md)** - Архитектура базы данных Supabase (20 мин)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Архитектурные решения и обоснования (20 мин)

### Практическая работа

- **[CODE_EXAMPLES.md](./CODE_EXAMPLES.md)** - Примеры кода для типичных задач (справка)
- **[FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md)** - Чеклист для добавления новых фич (10 мин)

### Справочная информация

- **[GLOSSARY.md](./GLOSSARY.md)** - Глоссарий терминов и сокращений (справка)
- **[AGENTS.md](./AGENTS.md)** - Правила для AI агентов

## 🚀 Быстрый старт

```bash
npm install
npm run dev  # ⚠️ Используй только webpack!
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🏗️ Технологии

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Supabase** (Auth + PostgreSQL)
- **Redux Toolkit** (RTK Query)
- **Tailwind CSS 4** + **shadcn/ui**

## 📁 Структура проекта (FSD)

```
src/
├── app/          # Next.js роуты
├── entities/     # Бизнес-сущности (profile, project, milestone, members)
├── features/     # Фичи (auth, create-project, invites)
├── widgets/      # Композитные UI блоки
├── page/         # Страничные компоненты
├── shared/       # Общие утилиты и хуки
└── store/        # Redux store
```

## 🎯 Основная идея

**Проблема:** Клиенты не понимают, за что платят, постоянно спрашивают "что там?", отчёты делаются вручную.

**Решение:** Портал для прозрачной коммуникации:

- Прогресс задач в реальном времени
- Автоматические отчёты
- Управление доступом клиентов
- История изменений

## 📊 Текущий статус

### ✅ Реализовано

- Авторизация (Supabase Auth)
- Multi-agency support
- CRUD проектов и задач
- Система приглашений
- Базовый UI/UX

### 🚧 В разработке

- Отчёты (Reports) - **приоритет!**
- Share access для клиентов
- Drag & Drop задач
- Настройки команды

## 🛠️ Команды

```bash
npm run dev        # Разработка (webpack)
npm run build      # Сборка
npm run start      # Production
npm run lint       # Линтинг
```

## 📝 Соглашения

- **Архитектура:** Feature-Sliced Design (FSD)
- **Стейт:** Redux Toolkit + RTK Query
- **Стили:** Tailwind CSS + CSS переменные
- **Компоненты:** shadcn/ui (Radix UI)

## 🔗 Полезные ссылки

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Redux Toolkit](https://redux-toolkit.js.org)

---

**Версия:** 0.1.0 | **Статус:** 🚧 Active Development
