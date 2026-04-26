import { Suspense } from "react";
import { connection } from "next/server";
import { SettingsOrgPage } from "@/src/page/settings/SettingsOrgPage";
import { Spinner } from "@/components/ui/spinner";

export const dynamic = "force-dynamic";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

export default async function OrganizationSettingsPage() {
  await connection();

  return (
    <Suspense fallback={<Loading />}>
      <SettingsOrgPage />
    </Suspense>
  );
}
