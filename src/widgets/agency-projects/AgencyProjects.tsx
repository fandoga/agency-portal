"use client";

import React, { useEffect } from "react";
import StatsCard from "./ui/StatsCard";
import ProjectCard from "./ui/ProjectCard";
import CreateProjectForm from "@/src/features/projects/create-project/CreateProjectModal";
import { Project } from "@/src/entities/project/lib/types";

const AgencyProjects = ({ data }: { data: Project[] }) => {
  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="w-full h-full">
      <div className="size-full">
        <StatsCard data={data} />
        <div className="flex flex-col overflow-hidden gap-2 pt-4">
          {data?.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
        <CreateProjectForm />
      </div>
    </div>
  );
};

export default AgencyProjects;
