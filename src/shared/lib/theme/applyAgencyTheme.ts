/**
 * Применяет цветовую тему агентства к CSS переменным
 * @param colorTheme - HEX цвет темы агентства (например, "#ff6b6b")
 */
export function applyAgencyTheme(colorTheme: string | null | undefined): void {
  if (!colorTheme) {
    // Если тема не задана, используем дефолтную
    return;
  }

  // Проверяем валидность HEX цвета
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexRegex.test(colorTheme)) {
    console.warn(`Invalid color theme: ${colorTheme}. Using default theme.`);
    return;
  }

  // Применяем цвет к CSS переменным
  const root = document.documentElement;

  // Основной акцентный цвет
  root.style.setProperty("--color-primary", colorTheme);
  root.style.setProperty("--color-accent", colorTheme);

  // Можно добавить дополнительные вариации цвета
  // Например, более светлые/темные версии для hover состояний
}

/**
 * Сбрасывает тему агентства к дефолтной
 */
export function resetAgencyTheme(): void {
  const root = document.documentElement;
  root.style.removeProperty("--color-primary");
  root.style.removeProperty("--color-accent");
}

/**
 * Извлекает цветовую тему из данных агентства
 * @param agency - Объект с данными агентства
 * @returns HEX цвет или null
 */
export function extractAgencyTheme(agency: {
  color_theme?: string | null;
}): string | null {
  return agency.color_theme || null;
}
