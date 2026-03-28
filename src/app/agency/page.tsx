"use client";

import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";
import EmptyProjects from "@/src/entities/project/components/EmptyProjects";
import Loader from "@/src/shared/components/Loader";
import AgencyProjects from "@/src/widgets/agency-projects/AgencyProjects";

export default function Agency() {
  const { isLoading, data } = useGetAgencyProjectsQuery();

  return (
    <div className="container pt-4">
      {isLoading ? <Loader /> : data ? <AgencyProjects /> : <EmptyProjects />}
    </div>
  );
}
