# 💻 CODE EXAMPLES - Типичные задачи

## 📝 Создание новой сущности (Entity)

### 1. Создай типы

```typescript
// src/entities/report/lib/types.ts
export type ReportStatus = "draft" | "sent" | "viewed";

export interface Report {
  id: string;
  project_id: string;
  agency_id: string;
  title: string;
  content: string;
  status: ReportStatus;
  created_at: string;
  viewed_at?: string | null;
}

export type CreateReportInput = {
  project_id: string;
  agency_id: string;
  title: string;
  content: string;
};
```

### 2. Создай API endpoints

```typescript
// src/entities/report/api/reportApi.ts
import { supabase } from "@/src/shared/api/supabase/client";
import { baseApi } from "@/src/shared/api/baseApi";
import { Report, CreateReportInput } from "../lib/types";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Получение отчётов
    getReports: build.query<Report[], string>({
      queryFn: async (agency_id) => {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("agency_id", agency_id)
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data };
      },
      providesTags: ["Report"],
    }),

    // Создание отчёта
    createReport: build.mutation<Report, CreateReportInput>({
      queryFn: async ({ project_id, agency_id, title, content }) => {
        // Проверка авторизации
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const id = crypto.randomUUID();

        const { data, error } = await supabase
          .from("reports")
          .insert({
            id,
            project_id,
            agency_id,
            title,
            content,
            status: "draft",
          })
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Report"],
    }),

    // Отметка "просмотрено"
    markReportAsViewed: build.mutation<Report, string>({
      queryFn: async (report_id) => {
        const { data, error } = await supabase
          .from("reports")
          .update({
            status: "viewed",
            viewed_at: new Date().toISOString(),
          })
          .eq("id", report_id)
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Report"],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useMarkReportAsViewedMutation,
} = reportApi;
```

### 3. Добавь tagType в baseApi

```typescript
// src/shared/api/baseApi.ts
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Profile", "Project", "Milestone", "Report", "Members"], // Добавь "Report"
  endpoints: () => ({}),
});
```

---

## 🎨 Создание новой фичи (Feature)

### Пример: Модальное окно создания отчёта

```typescript
// src/features/create-report/CreateReportModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateReportMutation } from "@/src/entities/report/api/reportApi";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import FormReportCreate from "./FormReportCreate";

export default function CreateReportModal() {
  const [open, setOpen] = useState(false);
  const [createReport, { isLoading }] = useCreateReportMutation();
  const { selectedAgencyId } = useGetAgencyData();

  const handleSubmit = async (values: { project_id: string; title: string; content: string }) => {
    if (!selectedAgencyId) return;

    try {
      await createReport({
        agency_id: selectedAgencyId,
        ...values,
      }).unwrap();

      setOpen(false);
      // Опционально: показать toast
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Создать отчёт
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый отчёт</DialogTitle>
          </DialogHeader>
          <FormReportCreate onSubmit={handleSubmit} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

```typescript
// src/features/create-report/FormReportCreate.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";

interface FormReportCreateProps {
  onSubmit: (values: { project_id: string; title: string; content: string }) => void;
  isLoading: boolean;
}

export default function FormReportCreate({ onSubmit, isLoading }: FormReportCreateProps) {
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: projects } = useGetAgencyProjectsQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ project_id: projectId, title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="project">Проект</Label>
        <Select
          value={projectId}
          onValueChange={setProjectId}
          required
        >
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Название отчёта</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Отчёт за неделю"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Содержание</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[200px] p-2 border rounded"
          placeholder="Что было сделано..."
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Создание..." : "Создать отчёт"}
      </Button>
    </form>
  );
}
```

---

## 🧩 Создание виджета (Widget)

```typescript
// src/widgets/agency-reports/AgencyReports.tsx
"use client";

import { useGetReportsQuery } from "@/src/entities/report/api/reportApi";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import Loading from "@/src/shared/ui/loading";
import ReportCard from "./ui/ReportCard";
import EmptyReports from "./ui/EmptyReports";
import CreateReportModal from "@/src/features/create-report/CreateReportModal";

export default function AgencyReports() {
  const { selectedAgencyId } = useGetAgencyData();
  const { data: reports, isLoading } = useGetReportsQuery(selectedAgencyId || "", {
    skip: !selectedAgencyId,
  });

  if (isLoading) {
    return <Loading text="Загружаем отчёты" />;
  }

  if (!reports || reports.length === 0) {
    return <EmptyReports />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Отчёты</h2>
        <CreateReportModal />
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Создание страницы

```typescript
// src/page/reports/ReportsPage.tsx
"use client";

import AgencyReports from "@/src/widgets/agency-reports/AgencyReports";

export default function ReportsPage() {
  return (
    <div className="container">
      <AgencyReports />
    </div>
  );
}
```

```typescript
// src/app/reports/page.tsx
import ReportsPage from "@/src/page/reports/ReportsPage";

export default function Page() {
  return <ReportsPage />;
}
```

---

## 🔐 Защита роута (Auth Guard)

```typescript
// src/app/reports/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/shared/providers/authProvider";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import Loading from "@/src/shared/ui/loading";
import ReportsPage from "@/src/page/reports/ReportsPage";

export default function Page() {
  const router = useRouter();
  const { session } = useAuth();
  const { selectedAgencyId, isLoading } = useGetAgencyData();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/auth");
    }
    if (!isLoading && session && !selectedAgencyId) {
      router.push("/auth/choose-agency");
    }
  }, [session, selectedAgencyId, isLoading, router]);

  if (isLoading || !session || !selectedAgencyId) {
    return <Loading text="Проверка доступа" />;
  }

  return <ReportsPage />;
}
```

---

## 🎨 Кастомный хук

```typescript
// src/shared/hooks/useReports.ts
import { useGetReportsQuery } from "@/src/entities/report/api/reportApi";
import { useGetAgencyData } from "./api";

export const useReports = () => {
  const { selectedAgencyId } = useGetAgencyData();
  const {
    data: reports,
    isLoading,
    error,
  } = useGetReportsQuery(selectedAgencyId || "", { skip: !selectedAgencyId });

  const draftReports = reports?.filter((r) => r.status === "draft") || [];
  const sentReports = reports?.filter((r) => r.status === "sent") || [];
  const viewedReports = reports?.filter((r) => r.status === "viewed") || [];

  return {
    reports,
    draftReports,
    sentReports,
    viewedReports,
    isLoading,
    error,
  };
};
```

---

## 🎯 Empty State компонент

```typescript
// src/entities/report/ui/EmptyReports.tsx
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyReports() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <FileText className="w-24 h-24 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">Отчётов пока нет</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Создайте первый отчёт, чтобы показать клиенту прогресс по проекту
      </p>
      <Button size="lg">Создать отчёт</Button>
    </div>
  );
}
```

---

## 🎨 Status Badge компонент

```typescript
// src/shared/ui/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "draft" | "sent" | "viewed" | "todo" | "in_progress" | "done" | "review";

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-gray-500" },
  sent: { label: "Отправлено", className: "bg-blue-500" },
  viewed: { label: "Просмотрено", className: "bg-green-500" },
  todo: { label: "К выполнению", className: "bg-gray-500" },
  in_progress: { label: "В работе", className: "bg-blue-500" },
  done: { label: "Готово", className: "bg-green-500" },
  review: { label: "На проверке", className: "bg-yellow-500" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, "text-white", className)}>
      {config.label}
    </Badge>
  );
}
```

---

## 🔄 Обновление навбара (добавление новой секции)

```typescript
// src/widgets/agency-navbar/AgencyNavbar.tsx

// 1. Импортируй иконку
import { ReportsIcon } from "@/src/shared/icons/NavIcons";

// 2. Обнови navItems
const navItems = [
  { id: "home", href: "/agency", Icon: HomeIcon },
  { id: "reports", href: "/reports", Icon: ReportsIcon }, // Обнови href!
  { id: "clients", href: "/clients", Icon: ClientsIcon },
  { id: "settings", href: "/settings", Icon: SettingsIcon },
] as const;

// 3. Обнови определение currentPage
const currentPage: NavItemId = pathname?.startsWith("/settings")
  ? "settings"
  : pathname?.startsWith("/reports") // Добавь проверку
    ? "reports"
    : pathname?.startsWith("/clients")
      ? "clients"
      : pathname?.startsWith("/agency")
        ? "home"
        : "";

// 4. Обнови isShowing
const isShowing =
  pathname?.startsWith("/agency") ||
  pathname?.startsWith("/settings") ||
  pathname?.startsWith("/reports") || // Добавь
  pathname?.startsWith("/clients"); // Добавь
```

---

## 📊 Supabase Migration (создание таблицы)

```sql
-- Создание таблицы reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_reports_agency_id ON reports(agency_id);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_status ON reports(status);

-- RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Политика: пользователь видит только отчёты своего агентства
CREATE POLICY "Users can view their agency reports"
  ON reports FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Политика: пользователь может создавать отчёты для своего агентства
CREATE POLICY "Users can create reports for their agency"
  ON reports FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );
```

---

## 🎯 Полезные сниппеты

### Debounced Search

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Использование:
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);
```

### Copy to Clipboard

```typescript
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Показать toast: "Скопировано!"
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
```

### Format Date

```typescript
export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

// Использование:
formatDate("2026-04-25"); // "25 апреля 2026"
```

---

**Больше примеров в коде проекта!**
