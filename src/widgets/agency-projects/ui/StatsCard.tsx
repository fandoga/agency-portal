import { Badge } from "@/components/ui/badge";
import { Project } from "@/src/entities/project/lib/types";
import React from "react";

const StatsCard = ({ data }: { data: Project[] | undefined }) => {
  const total = data?.length || 0;
  const inProgress =
    data?.filter((item) => item.status === "in_progress").length || 0;
  const waitReview =
    data?.filter((item) => item.status === "wait_review").length || 0;
  const kpd = Math.floor(
    ((data?.filter((item) => item.status === "completed").length || 0) /
      total) *
      100,
  );

  const kpdFull = kpd >= 70;

  return (
    <div className="flex gap-2">
      <Badge variant="secondary">В работе: {inProgress}</Badge>
      <Badge variant="secondary">Ожидают ревью: {waitReview}</Badge>
      <Badge
        className={`${kpdFull ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"}`}
        variant="secondary"
      >
        КПД недели: {kpd >= 0 ? kpd : 0}%
      </Badge>
    </div>
  );
};

export default StatsCard;
