import React, { Suspense } from "react";
import ClientProjectPage from "@/src/page/client-project/ClientProjectPage";
import { Spinner } from "@/components/ui/spinner";

interface ClientProjectRouteProps {
  params: Promise<{
    share_token: string;
  }>;
}

export default async function ClientProjectRoute({
  params,
}: ClientProjectRouteProps) {
  const { share_token } = await params;

  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Spinner className="mx-auto" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      }
    >
      <ClientProjectPage shareToken={share_token} />
    </Suspense>
  );
}
