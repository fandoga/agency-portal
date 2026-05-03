import React, { useMemo, useState } from "react";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Project } from "@/src/entities/project/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import ProjectDescription from "./ProjectDescription";
import { useDraggable } from "@dnd-kit/react";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import {
  RestrictLeftWithLimit,
  RestrictRightWithLimit,
} from "@/src/shared/utils/dnd-modifiers/RestrictLeftWithLimit";
import { Trash2 } from "lucide-react";

const ProjectCard = ({ project }: { project: Project }) => {
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

  const statusLabel = project.status
    ? statusLabelMap[project.status]
    : "Не задан";

  const statusColor = project.status ? statusColorMap[project.status] : "gray";

  const badgeClassByColor: Record<string, string> = {
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    pink: "bg-brand-300 text-white dark:bg-brand-600 dark:text-white",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
  };

  const badgeClassName =
    badgeClassByColor[statusColor] ?? badgeClassByColor.gray;

  //-------------------------------

  const { ref } = useDraggable({
    id: project.id,
    modifiers: [
      RestrictToHorizontalAxis,
      RestrictLeftWithLimit,
      RestrictRightWithLimit,
    ],
    disabled: false,
  });

  const progressValue = useMemo(() => {
    const all = project.milestones || [];
    const ready = all?.filter((mile) => mile.status === "done") || [];
    return 100 / (all.length / ready.length);
  }, [project.milestones]);

  return (
    <>
      <div
        ref={ref}
        className="relative w-full touch-none select-none overscroll-contain"
        style={{ touchAction: "none", WebkitTouchCallout: "none" }}
      >
        <Item className="py-3" variant={"outline"}>
          <ItemContent>
            <div className="flex justify-between items-center pb-2">
              <ItemTitle className="text-lg">
                <span className="inline-flex">{project.name}</span>
              </ItemTitle>
              <div className="flex items-center gap-2">
                <Badge className={badgeClassName}>{statusLabel}</Badge>
              </div>
            </div>
            <Accordion type="single" collapsible defaultValue="plans">
              <AccordionItem value={"item"}>
                <AccordionTrigger className="p-0 ">
                  <Progress
                    value={progressValue}
                    className="w-[80%] "
                  ></Progress>
                </AccordionTrigger>
                <AccordionContent className="pb-0 h-auto">
                  <ProjectDescription project={project} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ItemContent>
        </Item>
        <div className="absolute top-0 right-[-40%] bg-brand-600 h-full rounded-lg w-28">
          <Trash2 className="m-auto mr-15 h-full" color="white" size={32} />
        </div>
      </div>
    </>
  );
};

export default ProjectCard;
