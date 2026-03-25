import React, { useState } from "react";
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

const ProjectCard = ({ project }: { project: Project }) => {
  const statusLabelMap: Record<NonNullable<Project["status"]>, string> = {
    wait_review: "Ожидает ревью",
    active: "В работе",
    paused: "На паузе",
    in_progress: "В работе",
    completed: "Завершен",
  };

  const statusColorMap: Record<NonNullable<Project["status"]>, string> = {
    wait_review: "orange",
    active: "pink",
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
      "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    pink: "bg-accent text-white dark:bg-accent dark:text-white",
    red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    gray: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
  };

  const badgeClassName =
    badgeClassByColor[statusColor] ?? badgeClassByColor.gray;

  //-------------------------------

  const [rndmValue] = useState(() => Math.random() * (100 - 0));
  console.log(rndmValue);

  return (
    <Item className="py-3" variant={"outline"}>
      <ItemContent>
        <div className="flex justify-between items-center pb-2">
          <ItemTitle className="text-lg">{project.name}</ItemTitle>
          <Badge className={badgeClassName}>{statusLabel}</Badge>
        </div>
        <Accordion type="single" collapsible defaultValue="plans">
          <AccordionItem value={"item"}>
            <AccordionTrigger className="p-0 ">
              <Progress value={rndmValue} className="w-[80%] "></Progress>
            </AccordionTrigger>
            <AccordionContent> {project.description}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </ItemContent>
    </Item>
  );
};

export default ProjectCard;
