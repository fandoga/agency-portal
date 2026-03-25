"use client";

import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";
import EmptyProjects from "@/src/entities/project/components/EmptyProjects";
import React, { useEffect } from "react";
import StatsCard from "./ui/StatsCard";
import ProjectCard from "./ui/ProjectCard";

const AgencyProjects = () => {
  const { data } = useGetAgencyProjectsQuery();

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="w-full h-full">
      <StatsCard data={data} />
      <div className="w-full flex flex-col gap-2 pt-4">
        {data ? (
          data?.map((proj) => <ProjectCard key={proj.id} project={proj} />)
        ) : (
          <EmptyProjects />
        )}
      </div>
    </div>
  );
};

export default AgencyProjects;
