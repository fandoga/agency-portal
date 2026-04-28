"use client";

import React from "react";
import ClientLayout from "@/src/widgets/client-layout/ClientLayout";

interface ClientErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ClientErrorBoundary({
  error,
  reset,
}: ClientErrorBoundaryProps) {
  // Логируем ошибку для debugging
  React.useEffect(() => {
    console.error("Client portal error:", error);
  }, [error]);

  return (
    <ClientLayout>
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold">Что-то пошло не так</h1>
          <p className="text-muted-foreground">
            Произошла ошибка при загрузке страницы.
          </p>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Попробовать снова
          </button>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-4">
              Код ошибки: {error.digest}
            </p>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
