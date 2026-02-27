"use client";

import { useEffect, type ReactNode } from "react";
import type { ThemeConfig } from "@/lib/theme";

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function applyNestedVars(
  root: HTMLElement,
  prefix: string,
  data: Record<string, Record<string, string>> | undefined
) {
  if (!data) return;
  for (const [group, props] of Object.entries(data)) {
    for (const [prop, value] of Object.entries(props)) {
      if (value === "") continue;
      root.style.setProperty(
        `--${prefix}-${camelToKebab(group)}-${camelToKebab(prop)}`,
        value
      );
    }
  }
}

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;

  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${camelToKebab(key)}`, value);
  }

  for (const [key, font] of Object.entries(theme.fonts)) {
    root.style.setProperty(`--font-${camelToKebab(key)}`, font.family);
    root.style.setProperty(`--font-${camelToKebab(key)}-weight`, font.weight);
  }

  for (const [key, value] of Object.entries(theme.layout)) {
    root.style.setProperty(`--layout-${camelToKebab(key)}`, value);
  }

  for (const [compName, props] of Object.entries(theme.components)) {
    for (const [prop, value] of Object.entries(props)) {
      root.style.setProperty(`--${camelToKebab(compName)}-${camelToKebab(prop)}`, value);
    }
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    root.style.setProperty(`--spacing-${camelToKebab(key)}`, value);
  }

  applyNestedVars(root, "el", theme.elements);
  applyNestedVars(root, "section", theme.sections);
  applyNestedVars(root, "bg", theme.backgrounds);
  applyNestedVars(root, "effect", theme.effects);
}

export default function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeConfig;
  children: ReactNode;
}) {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
