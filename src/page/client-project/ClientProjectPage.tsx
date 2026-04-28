"use client";

import React from "react";
import { useGetClientProjectByShareTokenQuery } from "@/src/entities/project/api/projectApi";
import ClientLayout from "@/src/widgets/client-layout/ClientLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { MilestoneStatus } from "@/src/entities/milestone/lib/types";
import { Project, ProjectStatus } from "@/src/entities/project/lib/types";
import { Calendar, Check } from "lucide-react";

interface ClientProjectPageProps {
  shareToken: string;
}

// Маппинг статусов на русский язык

const statusLabelMap: Record<NonNullable<Project["status"]>, string> = {
  wait_review: "Ожидает ревью",
  paused: "На паузе",
  in_progress: "В работе",
  completed: "Завершен",
};

const statusColorMap: Record<NonNullable<Project["status"]>, string> = {
  wait_review: "orange",
  paused: "red",
  in_progress: "pink",
  completed: "green",
};

const mileStatusLabels: Record<MilestoneStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

const mileStatusColors: Record<
  MilestoneStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  todo: "outline",
  in_progress: "secondary",
  review: "default",
  done: "default",
};

export default function ClientProjectPage({
  shareToken,
}: ClientProjectPageProps) {
  const { data, isLoading, error } =
    useGetClientProjectByShareTokenQuery(shareToken);

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Spinner className="mx-auto" />
            <p className="text-muted-foreground">Загрузка проекта...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !data) {
    return (
      <ClientLayout>
        <div className="px-4 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold">Проект не найден</h1>
            <p className="text-muted-foreground">
              Проект с указанным токеном не существует или был удалён.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Если вы считаете, что это ошибка, обратитесь к вашему менеджеру
              проекта.
            </p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const { project, agency } = data;
  const milestones = project.milestones || [];

  const statusColor = project.status ? statusColorMap[project.status] : "gray";

  const badgeClassByColor: Record<string, string> = {
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    pink: "bg-brand-300 text-white dark:bg-brand-600 dark:text-white",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
  };

  const milestoneBallColorByStatus: Record<string, string> = {
    todo: "bg-gray-400",
    in_progress: "bg-brand-700",
    done: "bg-green-500",
    review: "bg-orange-500",
  };

  const badgeClassName =
    badgeClassByColor[statusColor] ?? badgeClassByColor.gray;

  // Подсчёт прогресса
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "done",
  ).length;
  const progressPercentage =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  return (
    <ClientLayout agency={agency}>
      <div className="px-4 py-4 max-w-5xl mx-auto space-y-6">
        {/* Заголовок проекта */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            {project.status && (
              <Badge className={badgeClassName}>
                {statusLabelMap[project.status]}
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground text-lg">
              {project.description}
            </p>
          )}
          {project.created_at && (
            <p className="text-sm text-muted-foreground">
              Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")}
            </p>
          )}
        </div>

        {/* Прогресс выполнения */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Прогресс выполнения</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Выполнено задач: {completedMilestones} из {totalMilestones}
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Список задач */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Задачи проекта</h2>

          {milestones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Задачи ещё не добавлены</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {milestones.map((milestone) => {
                const mileStatus = milestone.status ?? "todo";
                const ballColorClass =
                  milestoneBallColorByStatus[mileStatus] ??
                  milestoneBallColorByStatus.todo;

                return (
                  <Card key={milestone.id}>
                    <CardContent className="">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 flex items-center gap-3 space-y-1">
                            <span
                              aria-hidden="true"
                              className={`mt-1.5 rounded-full h-2 w-2 shrink-0 ${ballColorClass}`}
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg">{milestone.name}</h3>
                              <p className="">{milestone.description}</p>
                            </div>
                          </div>
                        </div>

                        {milestone.due_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              <Calendar size={18} />
                            </span>
                            <span>
                              Срок:{" "}
                              {new Date(milestone.due_date).toLocaleDateString(
                                "ru-RU",
                              )}
                            </span>
                          </div>
                        )}

                        {milestone.completed_at && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              <Check size={18} />
                            </span>
                            <span>
                              Завершено:{" "}
                              {new Date(
                                milestone.completed_at,
                              ).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
