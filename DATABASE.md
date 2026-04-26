# 🗄️ DATABASE ARCHITECTURE - Supabase

Полная документация по архитектуре базы данных проекта Agency Client Portal.

**Данные получены через Supabase MCP** ✅

---

## 📊 Обзор

**СУБД:** PostgreSQL 17 (через Supabase)  
**URL:** `https://ocaywlkmtpahhpbyfrty.supabase.co`  
**Безопасность:** Row Level Security (RLS) включён на всех таблицах (кроме reports)  
**Расширения:** uuid-ossp, pgcrypto, pg_stat_statements, pg_cron, pg_graphql, supabase_vault

**Статистика:**

- Таблиц: 6
- Записей: profiles (3), projects (3), milestones (3), agency_members (4), invites (0), reports (0)
- RPC функций: 5

---

## 🏗️ Схема базы данных

### Основные таблицы

```
auth.users (Supabase Auth)
    ↓
profiles (Агентства) [3 записи]
    ↓
    ├── projects (Проекты) [3 записи]
    │   ↓
    │   ├── milestones (Задачи/Этапы) [3 записи]
    │   └── reports (Отчёты) [0 записей] ⚠️ RLS отключён
    │
    ├── agency_members (Члены команды) [4 записи]
    │   └── user_id → auth.users
    │
    └── invites (Приглашения) [0 записей]
```

---

## 📋 Таблицы (Детально)

### 1. `profiles` - Профили агентств

**Описание:** Основная таблица агентств. Каждое агентство имеет свой профиль.  
**RLS:** ✅ Включён  
**Записей:** 3

**Структура:**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agency_name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `user_id` | UUID | ❌ | - | ID владельца (auth.users) |
| `agency_name` | TEXT | ❌ | - | Название агентства |
| `website_url` | TEXT | ✅ | - | Сайт агентства |
| `logo_url` | TEXT | ✅ | - | URL логотипа |
| `updated_at` | TIMESTAMPTZ | ✅ | `timezone('utc', now())` | Дата обновления |

**Foreign Keys:**

- `user_id` → `auth.users.id`

**Referenced By:**

- `projects.agency_id` → `profiles.id`
- `invites.agency_id` → `profiles.id`
- `agency_members.agency_id` → `profiles.id`

**Триггеры:**

- `set_profiles_id_to_auth_uid` - Автоматически устанавливает `id` = `auth.uid()` при создании
- `handle_new_profile_agency_member` - Автоматически добавляет создателя в `agency_members` с ролью `owner`

---

### 2. `projects` - Проекты

**Описание:** Проекты агентства для клиентов. Содержат задачи (milestones) и отчёты (reports).  
**RLS:** ✅ Включён  
**Записей:** 3

**Структура:**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'active', 'wait_review', 'paused', 'completed')),
  share_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `agency_id` | UUID | ❌ | - | ID агентства |
| `name` | TEXT | ❌ | - | Название проекта |
| `description` | TEXT | ✅ | - | Описание проекта |
| `status` | TEXT | ✅ | `'in_progress'` | Статус проекта |
| `share_token` | UUID | ✅ | `gen_random_uuid()` | Токен для клиента |
| `created_at` | TIMESTAMPTZ | ✅ | `timezone('utc', now())` | Дата создания |

**Статусы проекта:**

- `in_progress` - В работе (по умолчанию)
- `active` - Активный
- `wait_review` - Ожидает проверки
- `paused` - Приостановлен
- `completed` - Завершён

**Foreign Keys:**

- `agency_id` → `profiles.id`

**Referenced By:**

- `reports.project_id` → `projects.id`
- `milestones.project_id` → `projects.id`

**Особенности:**

- `share_token` генерируется автоматически для публичного доступа клиентов
- Уникальный токен для каждого проекта

---

### 3. `milestones` - Задачи/Этапы проекта

**Описание:** Задачи или этапы проекта. Отображают прогресс работы.  
**RLS:** ✅ Включён  
**Записей:** 3

**Структура:**

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  due_date DATE,
  completed_at TIMESTAMPTZ
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `project_id` | UUID | ❌ | - | ID проекта |
| `name` | TEXT | ❌ | - | Название задачи |
| `description` | TEXT | ✅ | - | Описание задачи |
| `status` | TEXT | ✅ | `'todo'` | Статус задачи |
| `due_date` | DATE | ✅ | - | Дедлайн |
| `completed_at` | TIMESTAMPTZ | ✅ | - | Дата завершения |

**Статусы задачи:**

- `todo` - К выполнению (по умолчанию)
- `in_progress` - В работе
- `review` - На проверке
- `done` - Готово

**Foreign Keys:**

- `project_id` → `projects.id`

---

### 4. `reports` - Отчёты

**Описание:** Отчёты по проектам для клиентов.  
**RLS:** ⚠️ **ОТКЛЮЧЁН** (нужно включить!)  
**Записей:** 0

**Структура:**

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `project_id` | UUID | ❌ | - | ID проекта |
| `content` | TEXT | ❌ | - | Содержание отчёта |
| `created_at` | TIMESTAMPTZ | ✅ | `timezone('utc', now())` | Дата создания |

**Foreign Keys:**

- `project_id` → `projects.id`

**⚠️ ВАЖНО:** RLS отключён! Нужно включить и настроить политики безопасности.

**Рекомендуемые поля для добавления:**

- `title` TEXT - Название отчёта
- `status` TEXT - Статус (draft, sent, viewed)
- `viewed_at` TIMESTAMPTZ - Дата просмотра клиентом
- `agency_id` UUID - Для упрощения RLS политик

---

### 5. `agency_members` - Члены команды агентства

**Описание:** Связь пользователей с агентствами. Определяет роли и доступ.  
**RLS:** ✅ Включён  
**Записей:** 4

**Структура:**

```sql
CREATE TABLE agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES profiles(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  agency_name TEXT
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `agency_id` | UUID | ❌ | - | ID агентства |
| `user_id` | UUID | ❌ | - | ID пользователя |
| `role` | TEXT | ❌ | `'member'` | Роль пользователя |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Дата присоединения |
| `agency_name` | TEXT | ✅ | - | Название агентства (денормализация) |

**Роли:**

- `owner` - Владелец (полный доступ)
- `admin` - Администратор (управление проектами и командой)
- `member` - Участник (просмотр и комментарии)

**Foreign Keys:**

- `agency_id` → `profiles.id`
- `user_id` → `auth.users.id`

**Особенности:**

- `agency_name` - денормализованное поле для быстрого доступа
- Автоматически создаётся запись с ролью `owner` при создании профиля (триггер)

---

### 6. `invites` - Приглашения в команду

**Описание:** Приглашения новых пользователей в агентство.  
**RLS:** ✅ Включён  
**Записей:** 0  
**Комментарий:** "Invites from agency to people"

**Структура:**

```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  agency_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('accepted', 'pending', 'rejected', 'expired')),
  token UUID
);
```

**Поля:**
| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | Первичный ключ |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Дата создания |
| `agency_id` | UUID | ✅ | - | ID агентства |
| `role` | TEXT | ✅ | - | Роль для нового участника |
| `status` | TEXT | ✅ | `'pending'` | Статус приглашения |
| `token` | UUID | ✅ | - | Токен приглашения |

**Статусы приглашения:**

- `pending` - Ожидает принятия (по умолчанию)
- `accepted` - Принято
- `rejected` - Отклонено
- `expired` - Истекло

**Foreign Keys:**

- `agency_id` → `profiles.id`

**Рекомендации:**

- Добавить `expires_at` TIMESTAMPTZ для автоматического истечения
- Добавить уникальный индекс на `token`
- Добавить `DEFAULT gen_random_uuid()` для `token`

---

## 🔧 Stored Procedures (RPC Functions)

### 1. `get_agency_members_with_email(ag_id UUID)`

**Описание:** Получение списка членов агентства с email адресами.

**Параметры:**

- `ag_id` UUID - ID агентства

**Возвращает:** TABLE (user_id UUID, role TEXT, email TEXT)

**SQL:**

```sql
CREATE OR REPLACE FUNCTION get_agency_members_with_email(ag_id UUID)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  email TEXT
) AS $$
  SELECT
    am.user_id,
    am.role,
    au.email
  FROM public.agency_members am
  JOIN auth.users au ON au.id = am.user_id
  WHERE am.agency_id = ag_id;
$$ LANGUAGE SQL;
```

**Использование:**

```typescript
const { data } = await supabase.rpc("get_agency_members_with_email", {
  ag_id: agencyId,
});
```

---

### 2. `get_invite_by_token(p_token UUID)`

**Описание:** Получение приглашения по токену с названием агентства.

**Параметры:**

- `p_token` UUID - Токен приглашения

**Возвращает:** TABLE (id UUID, token UUID, agency_id UUID, role TEXT, status TEXT, created_at TIMESTAMPTZ, agency_name TEXT)

**SQL:**

```sql
CREATE OR REPLACE FUNCTION get_invite_by_token(p_token UUID)
RETURNS TABLE (
  id UUID,
  token UUID,
  agency_id UUID,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  agency_name TEXT
) AS $$
  SELECT
    i.id,
    i.token,
    i.agency_id,
    i.role,
    i.status,
    i.created_at,
    p.agency_name
  FROM public.invites i
  JOIN public.profiles p ON p.id = i.agency_id
  WHERE i.token = p_token
  LIMIT 1;
$$ LANGUAGE SQL;
```

**Использование:**

```typescript
const { data } = await supabase.rpc("get_invite_by_token", {
  p_token: token,
});
```

---

### 3. `accept_agency_invite(p_token UUID, p_user_id UUID, p_role TEXT)`

**Описание:** Принятие приглашения и добавление пользователя в агентство.

**Параметры:**

- `p_token` UUID - Токен приглашения
- `p_user_id` UUID - ID пользователя
- `p_role` TEXT (optional) - Роль (если не указана, берётся из приглашения)

**Возвращает:** VOID

**Логика:**

1. Проверяет, что вызывающий пользователь = `p_user_id` (безопасность)
2. Находит приглашение по токену (статус = 'pending')
3. Проверяет соответствие роли (если указана)
4. Добавляет пользователя в `agency_members` (idempotent)
5. Обновляет статус приглашения на 'accepted'

**SQL:**

```sql
CREATE OR REPLACE FUNCTION accept_agency_invite(
  p_token UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_agency_id UUID;
  v_invite_role TEXT;
BEGIN
  -- Проверка авторизации
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized user';
  END IF;

  -- Получение данных приглашения
  SELECT i.agency_id, i.role
    INTO v_agency_id, v_invite_role
  FROM public.invites i
  WHERE i.token = p_token
    AND i.status = 'pending'
  FOR UPDATE;

  IF v_agency_id IS NULL THEN
    RAISE EXCEPTION 'Invite not found or not pending';
  END IF;

  -- Проверка роли
  IF p_role IS NOT NULL THEN
    IF v_invite_role IS NOT NULL AND p_role <> v_invite_role THEN
      RAISE EXCEPTION 'Role mismatch';
    END IF;
  END IF;

  -- Добавление в команду
  INSERT INTO public.agency_members (agency_id, user_id, role)
  VALUES (v_agency_id, p_user_id, COALESCE(p_role, v_invite_role, 'member'))
  ON CONFLICT DO NOTHING;

  -- Обновление статуса приглашения
  UPDATE public.invites
  SET status = 'accepted'
  WHERE token = p_token
    AND status = 'pending';

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Использование:**

```typescript
const { error } = await supabase.rpc("accept_agency_invite", {
  p_token: token,
  p_user_id: userId,
  p_role: role, // опционально
});
```

---

### 4. `handle_new_profile_agency_member()` (Триггер)

**Описание:** Автоматически добавляет создателя профиля в `agency_members` с ролью `owner`.

**Тип:** TRIGGER

**SQL:**

```sql
CREATE OR REPLACE FUNCTION handle_new_profile_agency_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agency_members (agency_id, user_id, role, agency_name)
  VALUES (NEW.id, NEW.user_id, 'owner', NEW.agency_name)
  ON CONFLICT (agency_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile_agency_member();
```

---

### 5. `set_profiles_id_to_auth_uid()` (Триггер)

**Описание:** Автоматически устанавливает `id` профиля = `auth.uid()` при создании.

**Тип:** TRIGGER

**SQL:**

```sql
CREATE OR REPLACE FUNCTION set_profiles_id_to_auth_uid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE TRIGGER before_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profiles_id_to_auth_uid();
```

---

## 🔐 Row Level Security (RLS)

### Статус RLS по таблицам

| Таблица          | RLS | Статус          |
| ---------------- | --- | --------------- |
| `profiles`       | ✅  | Включён         |
| `projects`       | ✅  | Включён         |
| `milestones`     | ✅  | Включён         |
| `reports`        | ❌  | **ОТКЛЮЧЁН** ⚠️ |
| `agency_members` | ✅  | Включён         |
| `invites`        | ✅  | Включён         |

### ⚠️ КРИТИЧНО: Включить RLS для `reports`

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра
CREATE POLICY "Users can view their agency reports"
  ON reports FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );

-- Политика для создания
CREATE POLICY "Users can create reports for their agency projects"
  ON reports FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );
```

---

## 📊 Диаграмма связей (ER Diagram)

```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
└────────┬────────┘
         │
         │ user_id
         ▼
┌─────────────────┐
│    profiles     │◄──────────┐
│   (Агентства)   │           │
│   [3 записи]    │           │
└────────┬────────┘           │
         │                    │
         │ agency_id          │ agency_id
         ├────────────────────┼──────────────┐
         │                    │              │
         ▼                    ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────┐
│    projects     │  │agency_members│  │ invites  │
│   (Проекты)     │  │  (Команда)   │  │(Инвайты) │
│   [3 записи]    │  │  [4 записи]  │  │[0 записей]│
└────────┬────────┘  └──────────────┘  └──────────┘
         │
         │ project_id
         ├──────────────┐
         ▼              ▼
┌─────────────────┐  ┌──────────┐
│   milestones    │  │ reports  │
│    (Задачи)     │  │ (Отчёты) │
│   [3 записи]    │  │[0 записей]│
└─────────────────┘  └──────────┘
                     ⚠️ RLS OFF
```

---

## 🔍 Рекомендации по улучшению

### 1. Таблица `reports`

- ✅ Включить RLS
- ✅ Добавить поля: `title`, `status`, `viewed_at`, `agency_id`
- ✅ Добавить индексы на `project_id`, `status`

### 2. Таблица `invites`

- ✅ Добавить `expires_at` TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
- ✅ Добавить `DEFAULT gen_random_uuid()` для `token`
- ✅ Добавить уникальный индекс на `token`
- ✅ Создать cron job для очистки истёкших приглашений

### 3. Индексы

```sql
-- Для быстрого поиска по share_token
CREATE INDEX idx_projects_share_token ON projects(share_token);

-- Для фильтрации по статусу
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_milestones_status ON milestones(status);

-- Для сортировки
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
```

### 4. Триггеры для `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📈 Статистика использования

**Текущее состояние:**

- Агентств: 3
- Проектов: 3
- Задач: 3
- Членов команды: 4
- Приглашений: 0
- Отчётов: 0

**Средние значения:**

- Проектов на агентство: 1
- Задач на проект: 1
- Членов на агентство: 1.33

---

**Последнее обновление:** 2026-04-25  
**Версия БД:** 1.0  
**Источник данных:** Supabase MCP ✅
);

-- Индексы
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);

````

**Поля:**

- `id` - UUID, первичный ключ
- `user_id` - UUID, ссылка на создателя агентства (auth.users)
- `agency_name` - Название агентства
- `website_url` - Сайт агентства (опционально)
- `logo_url` - URL логотипа (опционально)
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

**Связи:**

- `user_id` → `auth.users.id` (создатель агентства)
- `id` ← `projects.agency_id` (проекты агентства)
- `id` ← `agency_members.agency_id` (члены команды)
- `id` ← `invites.agency_id` (приглашения)

**RLS Политики:**

```sql
-- Пользователь видит агентства, где он является членом
CREATE POLICY "Users can view their agencies"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Пользователь может создавать агентства
CREATE POLICY "Users can create agencies"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Пользователь может обновлять агентства, где он owner
CREATE POLICY "Owners can update their agencies"
  ON profiles FOR UPDATE
  USING (
    id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Пользователь может удалять агентства, где он owner
CREATE POLICY "Owners can delete their agencies"
  ON profiles FOR DELETE
  USING (
    id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
````

---

### 2. `projects` - Проекты

**Описание:** Проекты агентства для клиентов. Содержат задачи (milestones).

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('wait_review', 'paused', 'in_progress', 'completed')),
  share_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_projects_agency_id ON projects(agency_id);
CREATE INDEX idx_projects_share_token ON projects(share_token);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

**Поля:**

- `id` - UUID, первичный ключ
- `agency_id` - UUID, ссылка на агентство
- `name` - Название проекта
- `description` - Описание проекта (опционально)
- `status` - Статус проекта:
  - `in_progress` - В работе (по умолчанию)
  - `wait_review` - Ожидает проверки
  - `paused` - Приостановлен
  - `completed` - Завершён
- `share_token` - UUID токен для публичного доступа клиента
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

**Связи:**

- `agency_id` → `profiles.id` (агентство-владелец)
- `id` ← `milestones.project_id` (задачи проекта)

**RLS Политики:**

```sql
-- Пользователь видит проекты своего агентства
CREATE POLICY "Users can view their agency projects"
  ON projects FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Публичный доступ по share_token (для клиентов)
CREATE POLICY "Public access via share_token"
  ON projects FOR SELECT
  USING (share_token IS NOT NULL);

-- Пользователь может создавать проекты для своего агентства
CREATE POLICY "Users can create projects for their agency"
  ON projects FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Пользователь может обновлять проекты своего агентства
CREATE POLICY "Users can update their agency projects"
  ON projects FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Пользователь может удалять проекты своего агентства
CREATE POLICY "Users can delete their agency projects"
  ON projects FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );
```

**Особенности:**

- `share_token` генерируется автоматически при создании
- Используется для публичного доступа клиентов без авторизации
- Уникальный индекс на `share_token` для быстрого поиска

---

### 3. `milestones` - Задачи/Этапы проекта

**Описание:** Задачи или этапы проекта. Отображают прогресс работы.

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done', 'review')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
```

**Поля:**

- `id` - UUID, первичный ключ
- `project_id` - UUID, ссылка на проект
- `name` - Название задачи
- `description` - Описание задачи (опционально)
- `status` - Статус задачи:
  - `todo` - К выполнению (по умолчанию)
  - `in_progress` - В работе
  - `review` - На проверке
  - `done` - Готово
- `due_date` - Дедлайн (опционально)
- `completed_at` - Дата завершения (опционально)
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

**Связи:**

- `project_id` → `projects.id` (проект-владелец)

**RLS Политики:**

```sql
-- Пользователь видит задачи проектов своего агентства
CREATE POLICY "Users can view their agency milestones"
  ON milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );

-- Публичный доступ по share_token проекта (для клиентов)
CREATE POLICY "Public access via project share_token"
  ON milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE share_token IS NOT NULL
    )
  );

-- Пользователь может создавать задачи для проектов своего агентства
CREATE POLICY "Users can create milestones for their agency projects"
  ON milestones FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );

-- Пользователь может обновлять задачи проектов своего агентства
CREATE POLICY "Users can update their agency milestones"
  ON milestones FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );

-- Пользователь может удалять задачи проектов своего агентства
CREATE POLICY "Users can delete their agency milestones"
  ON milestones FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE agency_id IN (
        SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
      )
    )
  );
```

**Особенности:**

- Каскадное удаление при удалении проекта (`ON DELETE CASCADE`)
- `completed_at` заполняется автоматически при смене статуса на `done`

---

### 4. `agency_members` - Члены команды агентства

**Описание:** Связь пользователей с агентствами. Определяет роли и доступ.

```sql
CREATE TABLE agency_members (
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (agency_id, user_id)
);

-- Индексы
CREATE INDEX idx_agency_members_user_id ON agency_members(user_id);
CREATE INDEX idx_agency_members_role ON agency_members(role);
```

**Поля:**

- `agency_id` - UUID, ссылка на агентство
- `user_id` - UUID, ссылка на пользователя
- `role` - Роль пользователя:
  - `owner` - Владелец (полный доступ)
  - `admin` - Администратор (управление проектами и командой)
  - `member` - Участник (просмотр и комментарии)
- `joined_at` - Дата присоединения

**Связи:**

- `agency_id` → `profiles.id` (агентство)
- `user_id` → `auth.users.id` (пользователь)

**RLS Политики:**

```sql
-- Пользователь видит членов своих агентств
CREATE POLICY "Users can view their agency members"
  ON agency_members FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Owner/Admin могут добавлять членов
CREATE POLICY "Owners and admins can add members"
  ON agency_members FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Owner/Admin могут обновлять роли
CREATE POLICY "Owners and admins can update roles"
  ON agency_members FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Owner может удалять членов
CREATE POLICY "Owners can remove members"
  ON agency_members FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
```

**Особенности:**

- Составной первичный ключ (`agency_id`, `user_id`)
- Один пользователь может быть в нескольких агентствах
- Каскадное удаление при удалении агентства или пользователя

---

### 5. `invites` - Приглашения в команду

**Описание:** Приглашения новых пользователей в агентство.

```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Индексы
CREATE INDEX idx_invites_agency_id ON invites(agency_id);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
```

**Поля:**

- `id` - UUID, первичный ключ
- `agency_id` - UUID, ссылка на агентство
- `role` - Роль для нового участника
- `token` - UUID токен приглашения (уникальный)
- `status` - Статус приглашения:
  - `pending` - Ожидает принятия (по умолчанию)
  - `accepted` - Принято
  - `rejected` - Отклонено
  - `expired` - Истекло
- `created_at` - Дата создания
- `expires_at` - Дата истечения (по умолчанию +7 дней)

**Связи:**

- `agency_id` → `profiles.id` (агентство)

**RLS Политики:**

```sql
-- Публичный доступ по токену (для просмотра приглашения)
CREATE POLICY "Public access via token"
  ON invites FOR SELECT
  USING (token IS NOT NULL AND status = 'pending' AND expires_at > NOW());

-- Owner/Admin могут создавать приглашения
CREATE POLICY "Owners and admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Owner/Admin могут обновлять приглашения
CREATE POLICY "Owners and admins can update invites"
  ON invites FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Owner/Admin могут удалять приглашения
CREATE POLICY "Owners and admins can delete invites"
  ON invites FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

**Особенности:**

- `token` генерируется автоматически
- Автоматическое истечение через 7 дней
- Уникальный индекс на `token` для быстрого поиска

---

## 🔧 Stored Procedures (RPC Functions)

### 1. `get_agency_members_with_email`

**Описание:** Получение списка членов агентства с email адресами.

```sql
CREATE OR REPLACE FUNCTION get_agency_members_with_email(ag_id UUID)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.user_id,
    am.role,
    au.email
  FROM agency_members am
  JOIN auth.users au ON am.user_id = au.id
  WHERE am.agency_id = ag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Параметры:**

- `ag_id` - UUID агентства

**Возвращает:**

- `user_id` - UUID пользователя
- `role` - Роль пользователя
- `email` - Email пользователя

**Использование:**

```typescript
const { data } = await supabase.rpc("get_agency_members_with_email", {
  ag_id: agencyId,
});
```

---

### 2. `get_invite_by_token`

**Описание:** Получение приглашения по токену с названием агентства.

```sql
CREATE OR REPLACE FUNCTION get_invite_by_token(p_token UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  token UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  agency_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.role,
    i.token,
    i.status,
    i.created_at,
    p.agency_name
  FROM invites i
  JOIN profiles p ON i.agency_id = p.id
  WHERE i.token = p_token
    AND i.status = 'pending'
    AND i.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Параметры:**

- `p_token` - UUID токен приглашения

**Возвращает:**

- `id` - UUID приглашения
- `role` - Роль для нового участника
- `token` - UUID токен
- `status` - Статус приглашения
- `created_at` - Дата создания
- `agency_name` - Название агентства

**Использование:**

```typescript
const { data } = await supabase.rpc("get_invite_by_token", {
  p_token: token,
});
```

---

### 3. `accept_agency_invite`

**Описание:** Принятие приглашения и добавление пользователя в агентство.

```sql
CREATE OR REPLACE FUNCTION accept_agency_invite(
  p_token UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  email TEXT
) AS $$
DECLARE
  v_agency_id UUID;
  v_role TEXT;
BEGIN
  -- Получаем agency_id и role из приглашения
  SELECT agency_id, role INTO v_agency_id, v_role
  FROM invites
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF v_agency_id IS NULL THEN
    RAISE EXCEPTION 'Invite not found or expired';
  END IF;

  -- Используем переданную роль или роль из приглашения
  v_role := COALESCE(p_role, v_role);

  -- Добавляем пользователя в агентство
  INSERT INTO agency_members (agency_id, user_id, role)
  VALUES (v_agency_id, p_user_id, v_role)
  ON CONFLICT (agency_id, user_id) DO NOTHING;

  -- Обновляем статус приглашения
  UPDATE invites
  SET status = 'accepted'
  WHERE token = p_token;

  -- Возвращаем информацию о пользователе
  RETURN QUERY
  SELECT
    am.user_id,
    am.role,
    au.email
  FROM agency_members am
  JOIN auth.users au ON am.user_id = au.id
  WHERE am.agency_id = v_agency_id AND am.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Параметры:**

- `p_token` - UUID токен приглашения
- `p_user_id` - UUID пользователя
- `p_role` - Роль (опционально, по умолчанию из приглашения)

**Возвращает:**

- `user_id` - UUID пользователя
- `role` - Роль пользователя
- `email` - Email пользователя

**Использование:**

```typescript
const { data } = await supabase.rpc("accept_agency_invite", {
  p_token: token,
  p_user_id: userId,
  p_role: role, // опционально
});
```

---

## 🔐 Row Level Security (RLS)

### Принципы безопасности

1. **Все таблицы защищены RLS** - без политик доступа нет
2. **Проверка на уровне БД** - даже если клиент обойдёт React, RLS защитит
3. **Роли определяют доступ** - owner > admin > member
4. **Публичный доступ только по токенам** - share_token для проектов, token для инвайтов

### Иерархия ролей

```
owner (Владелец)
  ├── Полный доступ к агентству
  ├── Управление командой (добавление/удаление)
  ├── Управление проектами (CRUD)
  ├── Удаление агентства
  └── Создание приглашений

admin (Администратор)
  ├── Управление проектами (CRUD)
  ├── Управление командой (добавление)
  └── Создание приглашений

member (Участник)
  ├── Просмотр проектов
  ├── Комментарии (будущее)
  └── Просмотр команды
```

---

## 📊 Диаграмма связей (ER Diagram)

```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
└────────┬────────┘
         │
         │ user_id
         ▼
┌─────────────────┐
│    profiles     │◄──────────┐
│   (Агентства)   │           │
└────────┬────────┘           │
         │                    │
         │ agency_id          │ agency_id
         ├────────────────────┼──────────────┐
         │                    │              │
         ▼                    ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────┐
│    projects     │  │agency_members│  │ invites  │
│   (Проекты)     │  │  (Команда)   │  │(Инвайты) │
└────────┬────────┘  └──────────────┘  └──────────┘
         │
         │ project_id
         ▼
┌─────────────────┐
│   milestones    │
│    (Задачи)     │
└─────────────────┘
```

---

## 🔄 Типичные запросы

### Получение проектов с задачами

```typescript
const { data } = await supabase
  .from("projects")
  .select("*, milestones(*)")
  .eq("agency_id", agencyId)
  .order("created_at", { ascending: false });
```

### Получение проекта по share_token (для клиента)

```typescript
const { data } = await supabase
  .from("projects")
  .select("*, milestones(*)")
  .eq("share_token", token)
  .single();
```

### Создание проекта с share_token

```typescript
const id = crypto.randomUUID();
const share_token = crypto.randomUUID();

const { data } = await supabase
  .from("projects")
  .insert({
    id,
    agency_id,
    name,
    description,
    status: "in_progress",
    share_token,
  })
  .single();
```

### Получение членов команды с email

```typescript
const { data } = await supabase.rpc("get_agency_members_with_email", {
  ag_id: agencyId,
});
```

### Принятие приглашения

```typescript
const { data } = await supabase.rpc("accept_agency_invite", {
  p_token: token,
  p_user_id: userId,
});
```

---

## 🚀 Миграции (Будущие таблицы)

### `reports` - Отчёты (в разработке)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `files` - Файлы проектов (планируется)

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `comments` - Комментарии (планируется)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔧 Maintenance

### Очистка истёкших приглашений

```sql
-- Автоматическая очистка через cron job (Supabase)
DELETE FROM invites
WHERE status = 'pending' AND expires_at < NOW();
```

### Обновление updated_at триггером

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применить к таблицам
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📊 Индексы и производительность

### Существующие индексы

- `profiles`: `user_id`, `updated_at`
- `projects`: `agency_id`, `share_token`, `status`, `created_at`
- `milestones`: `project_id`, `status`, `due_date`
- `agency_members`: `user_id`, `role`
- `invites`: `agency_id`, `token`, `status`, `expires_at`

### Рекомендации

- Используй `SELECT` с конкретными полями (не `SELECT *`)
- Добавляй `.limit()` для больших списков
- Используй `.order()` с индексированными полями
- Кешируй частые запросы через RTK Query

---

## 🔗 Полезные ссылки

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)

---

**Последнее обновление:** 2026-04-25  
**Версия БД:** 1.0
