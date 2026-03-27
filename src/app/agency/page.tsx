"use client";

import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";
import Loader from "@/src/shared/components/Loader";
import AgencyProjects from "@/src/widgets/agency-projects/AgencyProjects";

export default function Test() {
  const { isLoading } = useGetAgencyProjectsQuery();

  return (
    <div className="container pt-4">
      {isLoading ? <Loader /> : <AgencyProjects />}
    </div>
  );
}
