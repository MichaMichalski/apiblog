import { prisma } from "@/lib/db";

// --- Header Builder ---

export interface HeaderBuilderColumn {
  id: "left" | "center" | "right";
  elements: string[];
}

export interface HeaderBuilderRow {
  id: string;
  enabled: boolean;
  background: string;
  textColor: string;
  columns: HeaderBuilderColumn[];
}

export interface HeaderBuilderConfig {
  rows: HeaderBuilderRow[];
  elementSettings: Record<string, Record<string, string>>;
}

const HEADER_BUILDER_KEY = "header_builder";

const defaultHeaderBuilder: HeaderBuilderConfig = {
  rows: [
    {
      id: "top-bar",
      enabled: false,
      background: "",
      textColor: "",
      columns: [
        { id: "left", elements: [] },
        { id: "center", elements: [] },
        { id: "right", elements: [] },
      ],
    },
    {
      id: "main",
      enabled: true,
      background: "",
      textColor: "",
      columns: [
        { id: "left", elements: ["logo"] },
        { id: "center", elements: [] },
        { id: "right", elements: ["primary-menu"] },
      ],
    },
    {
      id: "bottom-bar",
      enabled: false,
      background: "",
      textColor: "",
      columns: [
        { id: "left", elements: [] },
        { id: "center", elements: [] },
        { id: "right", elements: [] },
      ],
    },
  ],
  elementSettings: {
    "button": { text: "Kontakt", url: "/kontakt" },
    "custom-text": { text: "" },
    "custom-html": { html: "" },
  },
};

export async function getHeaderBuilder(): Promise<HeaderBuilderConfig> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: HEADER_BUILDER_KEY } });
    if (setting) return JSON.parse(setting.value) as HeaderBuilderConfig;
  } catch { /* fall through */ }
  return defaultHeaderBuilder;
}

export async function saveHeaderBuilder(config: HeaderBuilderConfig): Promise<void> {
  await prisma.setting.upsert({
    where: { key: HEADER_BUILDER_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: HEADER_BUILDER_KEY, value: JSON.stringify(config) },
  });
}

// --- Footer Builder ---

export interface FooterBuilderWidgetRow {
  id: "widgets";
  enabled: boolean;
  background: string;
  textColor: string;
  layout: string;
  widgetAreas: string[];
}

export interface FooterBuilderBarRow {
  id: "bottom-bar";
  enabled: boolean;
  background: string;
  textColor: string;
  columns: HeaderBuilderColumn[];
}

export type FooterBuilderRow = FooterBuilderWidgetRow | FooterBuilderBarRow;

export interface FooterBuilderConfig {
  rows: FooterBuilderRow[];
  elementSettings: Record<string, Record<string, string>>;
}

const FOOTER_BUILDER_KEY = "footer_builder";

const defaultFooterBuilder: FooterBuilderConfig = {
  rows: [
    {
      id: "widgets",
      enabled: false,
      background: "",
      textColor: "",
      layout: "3-columns",
      widgetAreas: ["footer-1", "footer-2", "footer-3"],
    },
    {
      id: "bottom-bar",
      enabled: true,
      background: "",
      textColor: "",
      columns: [
        { id: "left", elements: ["copyright"] },
        { id: "center", elements: [] },
        { id: "right", elements: ["footer-menu"] },
      ],
    },
  ],
  elementSettings: {
    "copyright": { text: "" },
  },
};

export async function getFooterBuilder(): Promise<FooterBuilderConfig> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: FOOTER_BUILDER_KEY } });
    if (setting) return JSON.parse(setting.value) as FooterBuilderConfig;
  } catch { /* fall through */ }
  return defaultFooterBuilder;
}

export async function saveFooterBuilder(config: FooterBuilderConfig): Promise<void> {
  await prisma.setting.upsert({
    where: { key: FOOTER_BUILDER_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: FOOTER_BUILDER_KEY, value: JSON.stringify(config) },
  });
}

// --- Homepage Settings ---

export interface HomepageSettings {
  type: "posts" | "page";
  staticPageId: string | null;
  blogPageId: string | null;
}

const HOMEPAGE_KEY = "homepage_settings";

const defaultHomepageSettings: HomepageSettings = {
  type: "posts",
  staticPageId: null,
  blogPageId: null,
};

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: HOMEPAGE_KEY } });
    if (setting) return JSON.parse(setting.value) as HomepageSettings;
  } catch { /* fall through */ }
  return defaultHomepageSettings;
}

export async function saveHomepageSettings(settings: HomepageSettings): Promise<void> {
  await prisma.setting.upsert({
    where: { key: HOMEPAGE_KEY },
    update: { value: JSON.stringify(settings) },
    create: { key: HOMEPAGE_KEY, value: JSON.stringify(settings) },
  });
}

// --- Blog Layout ---

export interface BlogLayout {
  layout: "grid" | "list" | "masonry";
  columns: number;
  showFeaturedImage: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showReadMore: boolean;
  excerptLength: number;
  readMoreText: string;
  pagination: "numbered" | "load-more" | "infinite";
  postsPerPage: number;
  sidebarEnabled: boolean;
  sidebarPosition: "left" | "right";
}

const BLOG_LAYOUT_KEY = "blog_layout";

const defaultBlogLayout: BlogLayout = {
  layout: "grid",
  columns: 3,
  showFeaturedImage: true,
  showExcerpt: true,
  showAuthor: true,
  showDate: true,
  showReadMore: true,
  excerptLength: 150,
  readMoreText: "Weiterlesen",
  pagination: "numbered",
  postsPerPage: 10,
  sidebarEnabled: false,
  sidebarPosition: "right",
};

export async function getBlogLayout(): Promise<BlogLayout> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: BLOG_LAYOUT_KEY } });
    if (setting) return JSON.parse(setting.value) as BlogLayout;
  } catch { /* fall through */ }
  return defaultBlogLayout;
}

export async function saveBlogLayout(layout: BlogLayout): Promise<void> {
  await prisma.setting.upsert({
    where: { key: BLOG_LAYOUT_KEY },
    update: { value: JSON.stringify(layout) },
    create: { key: BLOG_LAYOUT_KEY, value: JSON.stringify(layout) },
  });
}

// --- Reading Settings ---

export interface ReadingSettings {
  showFullContent: boolean;
  excerptLength: number;
  feedPostsCount: number;
  feedContentType: "excerpt" | "full";
  searchEngineVisibility: boolean;
}

const READING_KEY = "reading_settings";

const defaultReadingSettings: ReadingSettings = {
  showFullContent: false,
  excerptLength: 55,
  feedPostsCount: 10,
  feedContentType: "excerpt",
  searchEngineVisibility: false,
};

export async function getReadingSettings(): Promise<ReadingSettings> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: READING_KEY } });
    if (setting) return JSON.parse(setting.value) as ReadingSettings;
  } catch { /* fall through */ }
  return defaultReadingSettings;
}

export async function saveReadingSettings(settings: ReadingSettings): Promise<void> {
  await prisma.setting.upsert({
    where: { key: READING_KEY },
    update: { value: JSON.stringify(settings) },
    create: { key: READING_KEY, value: JSON.stringify(settings) },
  });
}

// --- Custom CSS ---

export interface CustomCSS {
  css: string;
}

const CUSTOM_CSS_KEY = "custom_css";

const defaultCustomCSS: CustomCSS = { css: "" };

export async function getCustomCSS(): Promise<CustomCSS> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: CUSTOM_CSS_KEY } });
    if (setting) return JSON.parse(setting.value) as CustomCSS;
  } catch { /* fall through */ }
  return defaultCustomCSS;
}

export async function saveCustomCSS(data: CustomCSS): Promise<void> {
  await prisma.setting.upsert({
    where: { key: CUSTOM_CSS_KEY },
    update: { value: JSON.stringify(data) },
    create: { key: CUSTOM_CSS_KEY, value: JSON.stringify(data) },
  });
}

// --- Header/Footer element types ---

export const HEADER_ELEMENTS = [
  { id: "logo", label: "Logo" },
  { id: "primary-menu", label: "Hauptmenü" },
  { id: "secondary-menu", label: "Sekundärmenü" },
  { id: "search-toggle", label: "Suche" },
  { id: "social-icons", label: "Social Icons" },
  { id: "button", label: "Button" },
  { id: "custom-text", label: "Text" },
  { id: "custom-html", label: "HTML" },
] as const;

export const FOOTER_ELEMENTS = [
  { id: "copyright", label: "Copyright" },
  { id: "footer-menu", label: "Footer-Menü" },
  { id: "social-icons", label: "Social Icons" },
  { id: "custom-text", label: "Text" },
  { id: "custom-html", label: "HTML" },
] as const;
