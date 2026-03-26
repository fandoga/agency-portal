import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/src/entities/project/lib/types";
import React from "react";

const ProjectDescription = ({ project }: { project: Project }) => {
  const milestoneBallColorByStatus: Record<string, string> = {
    todo: "bg-gray-400",
    in_progress: "bg-brand-700",
    done: "bg-green-500",
    review: "bg-orange-500",
  };

  return (
    <div>
      <p>{project.description}</p>
      {(project.milestones?.length ?? 0) > 0 && (
        <div className="pb-3">
          <Separator className="my-3" />
          <ul className="list-none p-0 m-0 space-y-2">
            {project.milestones?.map((mile) => {
              const mileStatus = mile.status ?? "todo";
              const ballColorClass =
                milestoneBallColorByStatus[mileStatus] ??
                milestoneBallColorByStatus.todo;

              return (
                <li key={mile.id} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 rounded-full h-2 w-2 ${ballColorClass}`}
                  />
                  <div>
                    <h3>{mile.title}</h3>
                    <p>{mile.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Button size={"xs"}>Новая задача</Button>
    </div>
  );
};

export default ProjectDescription;
