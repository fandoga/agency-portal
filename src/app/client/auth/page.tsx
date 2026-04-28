import React, { Suspense } from "react";
import ClientAuthHandler from "@/src/features/client-auth/ui/ClientAuthHandler";
import { Spinner } from "@/components/ui/spinner";

export default function ClientAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Spinner className="mx-auto" />
            <h1 className="text-2xl font-semibold">Загрузка...</h1>
          </div>
        </div>
      }
    >
      <ClientAuthHandler />
    </Suspense>
  );
}
