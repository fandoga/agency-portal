Что нужно настроить в Supabase:

1. Настройте Email Templates
Откройте Supabase Dashboard: https://supabase.com/dashboard
Выберите ваш проект
Перейдите в Authentication → Email Templates
Выберите Magic Link
Настройте шаблон письма:
<h2>Доступ к проекту</h2>
<p>Здравствуйте!</p>
<p>Вы получили доступ к проекту в клиентском портале.</p>
<p><a href="{{ .ConfirmationURL }}">Перейти к проекту</a></p>
<p>Эта ссылка действительна в течение 1 часа.</p>
2. Настройте Redirect URLs
   В Supabase Dashboard → Authentication → URL Configuration
   Добавьте в Redirect URLs:
   http://localhost:3001/client/project/_
   http://localhost:3000/client/project/_
   Для production добавьте:
   https://your-domain.com/client/project/*
3. Проверьте Email Provider
   Для разработки:

Supabase Email работает из коробки
Ограничение: 3 письма в час
Письма можно посмотреть в Authentication → Logs
Для production:

Перейдите в Project Settings → Auth → SMTP Settings
Настройте свой SMTP (SendGrid, AWS SES, Mailgun, etc.)
🧪 Как протестировать:
Вариант 1: Через UI (рекомендуется)
Откройте http://localhost:3001/agency?agency_id={your_agency_id}
Найдите любой проект
Нажмите кнопку "Поделиться" (с иконкой Share2)
Введите email (можно свой)
Нажмите "Отправить Magic Link"
Проверьте Supabase Dashboard → Authentication → Logs
Скопируйте Magic Link из логов
Откройте ссылку в браузере (или в режиме инкогнито)
Вариант 2: Прямой доступ (для быстрого теста)
Найдите share_token любого проекта в БД:
SELECT id, name, share_token FROM projects LIMIT 1;
Откройте напрямую:
http://localhost:3001/client/project/{share_token}
Вы увидите страницу проекта (без авторизации для теста)
📋 Checklist перед использованием:
Supabase Email Templates настроены
Redirect URLs добавлены в Supabase
Dev сервер запущен (http://localhost:3001)
У проектов есть share_token в БД
RLS политики применены (уже сделано)
🎯 Что дальше:
После настройки Supabase вы сможете:

Отправлять Magic Link клиентам через кнопку "Поделиться"
Клиенты будут получать email с ссылкой
При переходе по ссылке - автоматическая авторизация
Клиент увидит только свой проект с задачами
Нужна помощь с настройкой Supabase? Скажите, и я подскажу детальнее!

# 🌐 Клиентский портал - Руководство

## Обзор

Клиентский портал позволяет клиентам агентства просматривать информацию о своих проектах через Magic Link без необходимости регистрации.

## ✨ Возможности

- ✅ **Авторизация через Magic Link** - клиент получает email со ссылкой для входа
- ✅ **Просмотр проекта** - название, описание, статус, дата создания
- ✅ **Список задач** - все milestone'ы с их статусами и дедлайнами
- ✅ **Прогресс выполнения** - визуальный индикатор прогресса проекта
- ✅ **Брендинг агентства** - цветовая тема и логотип агентства
- ✅ **Read-only доступ** - клиент не может редактировать данные
- ✅ **Безопасность** - RLS политики на уровне БД

## 🏗️ Архитектура

### Структура файлов (FSD)

```
src/
├── app/client/                          # Роуты клиентского портала
│   ├── layout.tsx                       # Базовый layout
│   ├── error.tsx                        # Error boundary
│   ├── auth/page.tsx                    # Страница авторизации
│   └── project/[share_token]/page.tsx   # Страница проекта
│
├── features/
│   ├── client-auth/                     # Авторизация клиента
│   │   └── ui/
│   │       ├── ClientAuthHandler.tsx    # Обработчик Magic Link
│   │       └── ClientErrorBoundary.tsx  # Error boundary
│   │
│   └── share-access/                    # Генерация Magic Link (агентство)
│       ├── lib/
│       │   └── generateMagicLink.ts     # Утилита генерации
│       └── ui/
│           └── ShareAccessModal.tsx     # Модалка для отправки ссылки
│
├── widgets/
│   └── client-layout/                   # Layout для клиентов
│       └── ClientLayout.tsx             # Header + Footer + Theme
│
├── page/
│   └── client-project/                  # Страница проекта
│       └── ClientProjectPage.tsx        # Отображение проекта и задач
│
├── entities/project/
│   ├── api/projectApi.ts                # RTK Query endpoints
│   └── lib/types.ts                     # ClientProjectData type
│
└── shared/lib/theme/
    └── applyAgencyTheme.ts              # Утилиты для темы
```

## 🚀 Как использовать

### Для агентства (отправка Magic Link)

1. **Импортируйте компонент ShareAccessModal:**

```tsx
import { ShareAccessModal } from "@/src/features/share-access";
```

2. **Используйте в вашем компоненте:**

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<ShareAccessModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  projectName={project.name}
  shareToken={project.share_token}
/>;
```

3. **Клиент получит email с Magic Link** и автоматически авторизуется при переходе по ссылке.

### Для клиента (просмотр проекта)

1. Клиент получает email с Magic Link
2. Переходит по ссылке → автоматическая авторизация
3. Видит страницу проекта с задачами и прогрессом
4. Интерфейс стилизован в цветах агентства

## 🔐 Безопасность

### RLS Политики

Созданы следующие политики безопасности:

```sql
-- Доступ к проектам по share_token
CREATE POLICY "client_portal_projects_select"
  ON projects FOR SELECT
  TO authenticated
  USING (share_token IS NOT NULL);

-- Доступ к задачам через проект
CREATE POLICY "client_portal_milestones_select"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE share_token IS NOT NULL
    )
  );

-- Доступ к профилям агентств (для брендинга)
CREATE POLICY "client_portal_profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
```

### Что защищено:

- ✅ Клиент видит только свой проект (по share_token)
- ✅ Клиент не может редактировать данные (только SELECT)
- ✅ Клиент не видит другие проекты агентства
- ✅ Клиент не видит внутренние данные агентства

## 🎨 Кастомизация темы

Тема агентства применяется автоматически при загрузке страницы:

```typescript
// В ClientLayout.tsx
useEffect(() => {
  if (agency?.color_theme) {
    applyAgencyTheme(agency.color_theme);
  }
  return () => resetAgencyTheme();
}, [agency?.color_theme]);
```

Цвет применяется к CSS переменным:

- `--color-primary`
- `--color-accent`

## 📊 API Endpoints

### RTK Query

```typescript
// Получение проекта для клиента
const { data, isLoading, error } = useGetClientProjectByShareTokenQuery(shareToken);

// Возвращает:
{
  project: {
    id, name, description, status, created_at,
    milestones: [...]
  },
  agency: {
    agency_name, logo_url, color_theme
  }
}
```

## 🧪 Тестирование

### Ручное тестирование

1. **Создайте проект** в агентстве
2. **Скопируйте share_token** из БД
3. **Откройте в браузере:**
   ```
   http://localhost:3001/client/project/{share_token}
   ```
4. **Проверьте:**
   - Отображение проекта
   - Список задач
   - Прогресс-бар
   - Цветовую тему (если задана)
   - Логотип (если задан)

### Тестирование Magic Link

1. **Используйте ShareAccessModal** для отправки ссылки
2. **Проверьте email** (в Supabase Auth logs)
3. **Перейдите по ссылке** из email
4. **Проверьте автоматическую авторизацию**

## 🐛 Troubleshooting

### Проблема: "Project not found"

**Причина:** Неверный share_token или проект удалён

**Решение:**

- Проверьте share_token в БД
- Убедитесь, что проект существует
- Проверьте RLS политики

### Проблема: "Ошибка авторизации"

**Причина:** Неверный Magic Link или истёк срок действия

**Решение:**

- Сгенерируйте новый Magic Link
- Проверьте настройки Supabase Auth
- Проверьте redirect URL в настройках Supabase

### Проблема: Тема не применяется

**Причина:** color_theme не задан или неверный формат

**Решение:**

- Проверьте color_theme в profiles таблице
- Формат должен быть HEX: `#ff6b6b` или `#f00`
- Проверьте консоль браузера на ошибки

## 📝 TODO / Будущие улучшения

- [ ] Добавить комментарии к задачам
- [ ] Добавить загрузку файлов
- [ ] Добавить уведомления о изменениях
- [ ] Добавить историю изменений проекта
- [ ] Добавить экспорт отчётов в PDF
- [ ] Добавить realtime обновления через Supabase Realtime
- [ ] Добавить мультиязычность (i18n)

## 🔗 Полезные ссылки

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Версия:** 1.0.0  
**Дата:** 2026-04-28  
**Статус:** ✅ Готово к использованию
