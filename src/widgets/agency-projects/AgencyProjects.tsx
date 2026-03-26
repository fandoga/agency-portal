"use client";

import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";
import EmptyProjects from "@/src/entities/project/components/EmptyProjects";
import React, { useEffect } from "react";
import StatsCard from "./ui/StatsCard";
import ProjectCard from "./ui/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const AgencyProjects = () => {
  const { data } = useGetAgencyProjectsQuery();

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="w-full h-full">
      <StatsCard data={data} />
      <div className="w-full pt-4">
        {data ? (
          <div className="size-full flex flex-col gap-2">
            {data?.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
            <Button size={"icon-lg"} className="rounded-full mt-2">
              <Plus className="size-6" />
            </Button>
          </div>
        ) : (
          <EmptyProjects />
        )}
      </div>
    </div>
  );
};

export default AgencyProjects;
