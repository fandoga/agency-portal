"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/src/shared/api/supabase/client";
import { Spinner } from "@/components/ui/spinner";

export default function ClientAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Извлекаем параметры из URL
        const token = searchParams?.get("token");
        const shareToken = searchParams?.get("share_token");

        if (!token || !shareToken) {
          setError("Неверная ссылка. Отсутствуют необходимые параметры.");
          setIsAuthenticating(false);
          return;
        }

        // Проверяем текущую сессию
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Уже авторизован, перенаправляем на проект
          router.push(`/client/project/${shareToken}`);
          return;
        }

        // Если нет сессии, показываем ошибку (Magic Link должен быть обработан Supabase автоматически)
        setError(
          "Не удалось авторизоваться. Пожалуйста, используйте ссылку из письма.",
        );
        setIsAuthenticating(false);
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Произошла ошибка при авторизации. Попробуйте еще раз.");
        setIsAuthenticating(false);
      }
    };

    handleAuth();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold">Ошибка авторизации</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Если проблема повторяется, обратитесь к вашему менеджеру проекта.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Spinner className="mx-auto" />
        <h1 className="text-2xl font-semibold">Авторизация...</h1>
        <p className="text-muted-foreground">
          Пожалуйста, подождите, мы проверяем вашу ссылку
        </p>
      </div>
    </div>
  );
}
