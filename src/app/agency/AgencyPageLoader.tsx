"use client";

import nextDynamic from "next/dynamic";
import Loading from "@/src/shared/ui/loading";

const AgencyPage = nextDynamic(() => import("@/src/page/agency/AgencyPage"), {
  ssr: false,
  loading: () => <Loading text="Загружаем ваши проекты" />,
});

export default function AgencyPageLoader() {
  return <AgencyPage />;
}
