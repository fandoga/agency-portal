"use client";

import ClientErrorBoundary from "@/src/features/client-auth/ui/ClientErrorBoundary";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ClientErrorBoundary error={error} reset={reset} />;
}
