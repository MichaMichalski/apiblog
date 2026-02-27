import { prisma } from "@/lib/db";

export interface WidgetArea {
  id: string;
  name: string;
  description: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  areaId: string;
  sortOrder: number;
  settings: Record<string, unknown>;
}

export type WidgetType =
  | "text"
  | "recent-posts"
  | "categories"
  | "search"
  | "custom-html"
  | "social-links"
  | "newsletter"
  | "tag-cloud";

const WIDGET_AREAS_KEY = "widget_areas";
const WIDGETS_KEY = "widgets";

const defaultWidgetAreas: WidgetArea[] = [
  { id: "sidebar", name: "Sidebar", description: "Rechte Seitenleiste" },
  { id: "footer-1", name: "Footer Spalte 1", description: "" },
  { id: "footer-2", name: "Footer Spalte 2", description: "" },
  { id: "footer-3", name: "Footer Spalte 3", description: "" },
  { id: "before-content", name: "Vor dem Inhalt", description: "" },
  { id: "after-content", name: "Nach dem Inhalt", description: "" },
];

const defaultWidgets: Widget[] = [];

export async function getWidgetAreas(): Promise<WidgetArea[]> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: WIDGET_AREAS_KEY } });
    if (setting) return JSON.parse(setting.value) as WidgetArea[];
  } catch {
    // fall through
  }
  return defaultWidgetAreas;
}

export async function saveWidgetAreas(areas: WidgetArea[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: WIDGET_AREAS_KEY },
    update: { value: JSON.stringify(areas) },
    create: { key: WIDGET_AREAS_KEY, value: JSON.stringify(areas) },
  });
}

export async function getWidgets(): Promise<Widget[]> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: WIDGETS_KEY } });
    if (setting) return JSON.parse(setting.value) as Widget[];
  } catch {
    // fall through
  }
  return defaultWidgets;
}

export async function saveWidgets(widgets: Widget[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: WIDGETS_KEY },
    update: { value: JSON.stringify(widgets) },
    create: { key: WIDGETS_KEY, value: JSON.stringify(widgets) },
  });
}

export async function getWidgetsForArea(areaId: string): Promise<Widget[]> {
  const widgets = await getWidgets();
  return widgets
    .filter((w) => w.areaId === areaId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function generateWidgetId(): string {
  return "w_" + Math.random().toString(36).slice(2, 10);
}

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  "text": "Text",
  "recent-posts": "Neueste Beiträge",
  "categories": "Kategorien",
  "search": "Suche",
  "custom-html": "Benutzerdefiniertes HTML",
  "social-links": "Social Links",
  "newsletter": "Newsletter",
  "tag-cloud": "Tag-Wolke",
};

export function getDefaultWidgetSettings(type: WidgetType): Record<string, unknown> {
  switch (type) {
    case "text":
      return { title: "", content: "" };
    case "recent-posts":
      return { title: "Neueste Beiträge", count: 5, showDate: true, showImage: false };
    case "categories":
      return { title: "Kategorien", showCount: true };
    case "search":
      return { title: "Suche", placeholder: "Suchen..." };
    case "custom-html":
      return { content: "" };
    case "social-links":
      return { title: "Folge uns", links: [] };
    case "newsletter":
      return { title: "Newsletter", description: "Bleiben Sie auf dem Laufenden.", action: "" };
    case "tag-cloud":
      return { title: "Tags" };
    default:
      return {};
  }
}
