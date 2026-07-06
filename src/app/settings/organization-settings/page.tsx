import { Suspense } from "react";
import { SettingsOrgPage } from "@/src/page/settings/SettingsOrgPage";
import { Spinner } from "@/components/ui/spinner";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingsOrgPage />
    </Suspense>
  );
}
