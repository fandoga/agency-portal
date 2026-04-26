import { supabase } from "@/src/shared/api/supabase/client";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface UploadLogoResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validates file type and size
 */
export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Неподдерживаемый формат файла. Используйте PNG, JPG, SVG или WEBP";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Файл слишком большой. Максимальный размер: 2MB";
  }

  return null;
}

/**
 * Uploads logo file to Supabase Storage and returns public URL
 */
export async function uploadLogo(
  file: File,
  agencyId: string,
): Promise<UploadLogoResult> {
  // Validate file
  const validationError = validateFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${agencyId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("logos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка загрузки файла",
    };
  }
}
