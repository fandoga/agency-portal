"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/src/entities/project/lib/types";
import CreateMilestoneModal from "@/src/features/projects/create-milestone/CreateMilestoneModal";
import { useDeleteMilestoneMutation } from "@/src/entities/milestone/api/milestoneApi";
import { Share2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { ShareAccessModal } from "@/src/features/share-access";

const ProjectDescription = ({ project }: { project: Project }) => {
  const [deleteMilestone, { isLoading: isDeleting }] =
    useDeleteMilestoneMutation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { selectedAgencyId } = useGetAgencyData();

  const milestoneBallColorByStatus: Record<string, string> = {
    todo: "bg-gray-400",
    in_progress: "bg-brand-700",
    done: "bg-green-500",
    review: "bg-orange-500",
  };

  const sortedMilestones = project.milestones?.toSorted((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;

    return dateA - dateB;
  });

  return (
    <div>
      <p>{project.description}</p>
      {(project.milestones?.length ?? 0) > 0 && (
        <div className="pb-3">
          <Separator className="my-3" />
          <ul className="list-none p-0 m-0 space-y-2">
            {sortedMilestones?.map((mile) => {
              const mileStatus = mile.status ?? "todo";
              const ballColorClass =
                milestoneBallColorByStatus[mileStatus] ??
                milestoneBallColorByStatus.todo;

              return (
                <li
                  key={mile.id}
                  className="flex cursor-grab items-start gap-2 group"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 rounded-full h-2 w-2 shrink-0 ${ballColorClass}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3>{mile.name}</h3>
                    <p>{mile.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 opacity-70 hover:opacity-100"
                    disabled={isDeleting}
                    aria-label="Удалить задачу"
                    onClick={() => {
                      if (!selectedAgencyId) return;
                      void deleteMilestone({
                        agency_id: selectedAgencyId,
                        milestoneId: mile.id,
                        projectId: project.id,
                      }).unwrap();
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
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
            <Button size="xs" type="button">
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
