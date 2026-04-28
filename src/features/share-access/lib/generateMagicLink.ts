import { supabase } from "@/src/shared/api/supabase/client";

export interface GenerateMagicLinkParams {
  email: string;
  shareToken: string;
  projectName?: string;
}

export interface GenerateMagicLinkResult {
  success: boolean;
  magicLink?: string;
  error?: string;
}

/**
 * Генерирует Magic Link для клиента
 * @param params - Параметры для генерации ссылки
 * @returns Результат с ссылкой или ошибкой
 */
export async function generateMagicLink({
  email,
  shareToken,
  projectName,
}: GenerateMagicLinkParams): Promise<GenerateMagicLinkResult> {
  try {
    // Проверяем валидность email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Неверный формат email адреса",
      };
    }

    // Проверяем валидность share_token (должен быть UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(shareToken)) {
      return {
        success: false,
        error: "Неверный формат токена проекта",
      };
    }

    // Проверяем, существует ли проект с таким share_token
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("share_token", shareToken)
      .single();

    if (projectError || !project) {
      return {
        success: false,
        error: "Проект с указанным токеном не найден",
      };
    }

    // Формируем redirect URL
    const baseUrl = window.location.origin;
    const redirectTo = `${baseUrl}/client/project/${shareToken}`;

    // Генерируем Magic Link через Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          project_name: projectName || project.name,
          share_token: shareToken,
        },
      },
    });

    if (error) {
      console.error("Magic Link generation error:", error);
      return {
        success: false,
        error: `Ошибка при генерации ссылки: ${error.message}`,
      };
    }

    // Supabase отправляет email автоматически
    // Возвращаем успех (саму ссылку Supabase не возвращает из соображений безопасности)
    return {
      success: true,
      magicLink: `Magic Link отправлен на ${email}`,
    };
  } catch (err) {
    console.error("Unexpected error in generateMagicLink:", err);
    return {
      success: false,
      error: "Произошла непредвиденная ошибка",
    };
  }
}
