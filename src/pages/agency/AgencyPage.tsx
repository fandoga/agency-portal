"use client";

import { useGetAgencyProjectsQuery } from "@/src/entities/project/api/projectApi";
import EmptyProjects from "@/src/entities/project/ui/EmptyProjects";
import Loader from "@/src/shared/components/Loader";
import AgencyProjects from "@/src/widgets/agency-projects/AgencyProjects";
import { useSearchParams } from "next/navigation";

export default function AgencyPage() {
  const { isLoading, data } = useGetAgencyProjectsQuery();

  const searchParams = useSearchParams();

  const agencyProjects = data?.filter(
    (A) => A.agency_id === searchParams?.get("agency_id"),
  );

  return (
    <div className="container">
      {isLoading ? (
        <Loader text="Загружем ваши проекты" />
      ) : agencyProjects && agencyProjects?.length > 0 ? (
        <AgencyProjects data={agencyProjects} />
      ) : (
        <EmptyProjects />
      )}
    </div>
  );
}
