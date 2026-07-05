"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/src/entities/project/lib/types";
import CreateMilestoneModal from "@/src/features/projects/create-milestone/CreateMilestoneModal";
import {
  useDeleteMilestoneMutation,
  useUpdateMilestoneStatusMutation,
} from "@/src/entities/milestone/api/milestoneApi";
import type { MilestoneStatus } from "@/src/entities/milestone/lib/types";
import { Share2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { ShareAccessModal } from "@/src/features/share-access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DELETE_MILESTONE_ACTION = "delete-milestone";

const MILESTONE_STATUS_OPTIONS: {
  value: MilestoneStatus;
  label: string;
  ballClassName: string;
}[] = [
  { value: "todo", label: "В плане", ballClassName: "bg-gray-400" },
  { value: "in_progress", label: "В работе", ballClassName: "bg-brand-700" },
  { value: "review", label: "На ревью", ballClassName: "bg-orange-500" },
  { value: "done", label: "Готово", ballClassName: "bg-green-500" },
];

const milestoneStatusByValue = MILESTONE_STATUS_OPTIONS.reduce<
  Record<MilestoneStatus, (typeof MILESTONE_STATUS_OPTIONS)[number]>
>(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<MilestoneStatus, (typeof MILESTONE_STATUS_OPTIONS)[number]>,
);

const ProjectDescription = ({ project }: { project: Project }) => {
  const [deleteMilestone, { isLoading: isDeleting }] =
    useDeleteMilestoneMutation();
  const [updateMilestoneStatus, { isLoading: isUpdatingStatus }] =
    useUpdateMilestoneStatusMutation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(
    null,
  );
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(
    null,
  );

  const { selectedAgencyId } = useGetAgencyData();

  return (
    <div>
      <p>{project.description}</p>
      {(project.milestones?.length ?? 0) > 0 && (
        <div className="pb-3">
          <Separator className="my-3" />
          <ul className="list-none p-0 m-0 space-y-2">
            {project.milestones?.map((mile) => {
              const mileStatus = mile.status ?? "todo";
              const statusOption =
                milestoneStatusByValue[mileStatus] ??
                milestoneStatusByValue.todo;
              const isCurrentMilestoneUpdating =
                isUpdatingStatus && updatingMilestoneId === mile.id;
              const isCurrentMilestoneDeleting =
                isDeleting && deletingMilestoneId === mile.id;
              const isCurrentMilestoneBusy =
                isCurrentMilestoneUpdating || isCurrentMilestoneDeleting;

              return (
                <li
                  key={mile.id}
                  className="flex cursor-grab items-start gap-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <h3 className="min-w-0 font-semibold flex-1">
                        {mile.name}
                      </h3>
                      <Select
                        value={mileStatus}
                        disabled={isCurrentMilestoneBusy}
                        onValueChange={async (value) => {
                          if (!selectedAgencyId) return;
                          if (value === mileStatus) return;

                          if (value === DELETE_MILESTONE_ACTION) {
                            setDeletingMilestoneId(mile.id);

                            try {
                              await deleteMilestone({
                                agency_id: selectedAgencyId,
                                milestoneId: mile.id,
                                projectId: project.id,
                              }).unwrap();
                            } catch {
                              // Ошибка остаётся в состоянии RTK Query.
                            } finally {
                              setDeletingMilestoneId(null);
                            }

                            return;
                          }

                          setUpdatingMilestoneId(mile.id);

                          try {
                            await updateMilestoneStatus({
                              agency_id: selectedAgencyId,
                              milestoneId: mile.id,
                              projectId: project.id,
                              status: value as MilestoneStatus,
                            }).unwrap();
                          } catch {
                            // RTK Query вернёт прежнее состояние после invalidate/refetch.
                          } finally {
                            setUpdatingMilestoneId(null);
                          }
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label={`Изменить статус задачи ${mile.name}`}
                          className="h-6 shrink-0 border-0 bg-muted px-2 py-0 text-xs shadow-none"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span
                            aria-hidden="true"
                            className={`rounded-full h-2 w-2 shrink-0 ${statusOption.ballClassName}`}
                          />
                          <SelectValue>{statusOption.label}</SelectValue>
                        </SelectTrigger>
                        <SelectContent align="end" position="popper">
                          {MILESTONE_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span
                                aria-hidden="true"
                                className={`rounded-full h-2 w-2 shrink-0 ${option.ballClassName}`}
                              />
                              {option.label}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <SelectItem
                            value={DELETE_MILESTONE_ACTION}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            disabled={isCurrentMilestoneBusy}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            Удалить задачу
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p>{mile.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="flex justify-between items-center">
        <CreateMilestoneModal
          projectId={project.id}
          trigger={
            <Button size="xs" className="h-8 px-2" type="button">
              Новая задача
            </Button>
          }
        />
        <Button
          size="xs"
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          className="h-8 px-2 bg-muted"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Поделиться
        </Button>
      </div>

      {/* Модалка для отправки Magic Link */}
      {project.share_token && (
        <ShareAccessModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          projectName={project.name}
          shareToken={project.share_token}
        />
      )}
    </div>
  );
};

export default ProjectDescription;
