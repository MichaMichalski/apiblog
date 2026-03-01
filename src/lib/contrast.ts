function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(fg: string, bg: string): number | null {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;

  const l1 = relativeLuminance(...fgRgb);
  const l2 = relativeLuminance(...bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "fail";

export function getWcagLevel(ratio: number, largeText = false): WcagLevel {
  if (largeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "fail";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

export interface ContrastCheck {
  pair: string;
  fg: string;
  bg: string;
  ratio: number;
  level: WcagLevel;
}

export function checkThemeContrast(colors: Record<string, string>): ContrastCheck[] {
  const results: ContrastCheck[] = [];
  const bg = colors.background || "#FFFFFF";

  const pairs: [string, string, string][] = [
    ["Text / Hintergrund", colors.text || "#1F2937", bg],
    ["Gedämpfter Text / Hintergrund", colors.textMuted || "#6B7280", bg],
    ["Primary / Hintergrund", colors.primary || "#3B82F6", bg],
    ["Primary-Kontrast / Primary", colors.primaryContrast || "#FFFFFF", colors.primary || "#3B82F6"],
  ];

  if (colors.surface) {
    pairs.push(["Text / Fläche", colors.text || "#1F2937", colors.surface]);
    pairs.push(["Gedämpfter Text / Fläche", colors.textMuted || "#6B7280", colors.surface]);
  }

  for (const [pair, fg, pairBg] of pairs) {
    const ratio = getContrastRatio(fg, pairBg);
    if (ratio !== null) {
      results.push({ pair, fg, bg: pairBg, ratio, level: getWcagLevel(ratio) });
    }
  }

  return results;
}
