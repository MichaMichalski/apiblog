import { prisma } from "@/lib/db";
import defaultTheme from "@/config/theme.json";

export interface ThemeConfig {
  version: string;
  colors: Record<string, string>;
  fonts: Record<string, { family: string; weight: string }>;
  layout: Record<string, string>;
  components: Record<string, Record<string, string>>;
  spacing: Record<string, string>;
  elements?: Record<string, Record<string, string>>;
  sections?: Record<string, Record<string, string>>;
  backgrounds?: Record<string, Record<string, string>>;
  effects?: Record<string, Record<string, string>>;
}

const THEME_KEY = "theme";

export async function getThemeFromDB(): Promise<ThemeConfig> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: THEME_KEY } });
    if (setting) {
      return JSON.parse(setting.value) as ThemeConfig;
    }
  } catch {
    // DB not available or parse error — fall through to default
  }
  return defaultTheme as ThemeConfig;
}

export async function saveThemeToDB(theme: ThemeConfig): Promise<void> {
  await prisma.setting.upsert({
    where: { key: THEME_KEY },
    update: { value: JSON.stringify(theme) },
    create: { key: THEME_KEY, value: JSON.stringify(theme) },
  });
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function emitNestedVars(
  lines: string[],
  prefix: string,
  data: Record<string, Record<string, string>> | undefined
) {
  if (!data) return;
  for (const [group, props] of Object.entries(data)) {
    for (const [prop, value] of Object.entries(props)) {
      if (value === "") continue;
      lines.push(`  --${prefix}-${camelToKebab(group)}-${camelToKebab(prop)}: ${value};`);
    }
  }
}

export function themeToCSS(theme: ThemeConfig): string {
  const lines: string[] = [":root {"];

  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  --color-${camelToKebab(key)}: ${value};`);
  }

  for (const [key, font] of Object.entries(theme.fonts)) {
    lines.push(`  --font-${camelToKebab(key)}: ${font.family};`);
    lines.push(`  --font-${camelToKebab(key)}-weight: ${font.weight};`);
  }

  for (const [key, value] of Object.entries(theme.layout)) {
    lines.push(`  --layout-${camelToKebab(key)}: ${value};`);
  }

  for (const [compName, props] of Object.entries(theme.components)) {
    for (const [prop, value] of Object.entries(props)) {
      lines.push(`  --${camelToKebab(compName)}-${camelToKebab(prop)}: ${value};`);
    }
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    lines.push(`  --spacing-${camelToKebab(key)}: ${value};`);
  }

  emitNestedVars(lines, "el", theme.elements);
  emitNestedVars(lines, "section", theme.sections);
  emitNestedVars(lines, "bg", theme.backgrounds);
  emitNestedVars(lines, "effect", theme.effects);

  lines.push("}");
  return lines.join("\n");
}

export function getFontImportUrl(theme: ThemeConfig): string {
  const families = new Set<string>();
  for (const font of Object.values(theme.fonts)) {
    const family = font.family.split(",")[0].trim();
    if (family && !family.includes("system-ui") && !family.includes("serif") && !family.includes("sans-serif")) {
      families.add(`${family.replace(/ /g, "+")}:wght@${font.weight}`);
    }
  }
  if (families.size === 0) return "";
  return `https://fonts.googleapis.com/css2?${[...families].map((f) => `family=${f}`).join("&")}&display=swap`;
}
