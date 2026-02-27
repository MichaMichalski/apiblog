import { prisma } from "@/lib/db";

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: "custom" | "page" | "post";
  parentId: string | null;
  sortOrder: number;
  target: "_self" | "_blank";
  cssClass: string;
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuLocations {
  header: string | null;
  footer: string | null;
  mobile: string | null;
}

const MENUS_KEY = "menus";
const MENU_LOCATIONS_KEY = "menu_locations";

const defaultMenus: Menu[] = [
  {
    id: "primary",
    name: "Hauptnavigation",
    items: [
      { id: "m1", label: "Home", url: "/", type: "custom", parentId: null, sortOrder: 0, target: "_self", cssClass: "" },
      { id: "m2", label: "Blog", url: "/blog", type: "custom", parentId: null, sortOrder: 1, target: "_self", cssClass: "" },
    ],
  },
];

const defaultLocations: MenuLocations = {
  header: "primary",
  footer: null,
  mobile: "primary",
};

export async function getMenus(): Promise<Menu[]> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: MENUS_KEY } });
    if (setting) return JSON.parse(setting.value) as Menu[];
  } catch {
    // fall through
  }
  return defaultMenus;
}

export async function saveMenus(menus: Menu[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: MENUS_KEY },
    update: { value: JSON.stringify(menus) },
    create: { key: MENUS_KEY, value: JSON.stringify(menus) },
  });
}

export async function getMenuLocations(): Promise<MenuLocations> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: MENU_LOCATIONS_KEY } });
    if (setting) return JSON.parse(setting.value) as MenuLocations;
  } catch {
    // fall through
  }
  return defaultLocations;
}

export async function saveMenuLocations(locations: MenuLocations): Promise<void> {
  await prisma.setting.upsert({
    where: { key: MENU_LOCATIONS_KEY },
    update: { value: JSON.stringify(locations) },
    create: { key: MENU_LOCATIONS_KEY, value: JSON.stringify(locations) },
  });
}

export async function getMenuForLocation(location: keyof MenuLocations): Promise<Menu | null> {
  const locations = await getMenuLocations();
  const menuId = locations[location];
  if (!menuId) return null;

  const menus = await getMenus();
  return menus.find((m) => m.id === menuId) ?? null;
}

export function buildMenuTree(items: MenuItem[]): (MenuItem & { children: MenuItem[] })[] {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const topLevel = sorted.filter((i) => !i.parentId);
  return topLevel.map((item) => ({
    ...item,
    children: sorted.filter((i) => i.parentId === item.id),
  }));
}

export function generateMenuItemId(): string {
  return "mi_" + Math.random().toString(36).slice(2, 10);
}
