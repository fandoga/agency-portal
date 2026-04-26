/**
 * Validates organization name
 */
export function validateAgencyName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return "Минимум 2 символа";
  }
  if (trimmed.length > 100) {
    return "Максимум 100 символов";
  }
  return null;
}

/**
 * Validates color theme in hex format
 */
export function validateColorTheme(value: string): string | null {
  if (!value) return null; // Optional field

  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexPattern.test(value)) {
    return "Неверный формат цвета (используйте #RGB или #RRGGBB)";
  }

  return null;
}

/**
 * Validates logo URL format
 */
export function validateLogoUrl(value: string): string | null {
  if (!value) return null; // Optional field

  try {
    new URL(value);
    return null;
  } catch {
    return "Неверный формат URL";
  }
}
