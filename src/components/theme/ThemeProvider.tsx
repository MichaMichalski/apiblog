"use client";

import { useEffect, type ReactNode } from "react";
import type { ThemeConfig } from "@/lib/theme";

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
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
