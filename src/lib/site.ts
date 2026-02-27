import { prisma } from "@/lib/db";
import defaultSite from "@/config/site.json";

export interface SiteConfig {
  name: string;
  description: string;
  logo: string;
  favicon: string;
  language: string;
  postsPerPage: number;
  navigation: { label: string; href: string }[];
  footer: { text: string };
  social: { twitter: string; github: string; linkedin: string };
}

const SITE_KEY = "site";

export async function getSiteFromDB(): Promise<SiteConfig> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: SITE_KEY } });
    if (setting) {
      return JSON.parse(setting.value) as SiteConfig;
    }
  } catch {
    // DB not available or parse error — fall through to default
  }
  return defaultSite as SiteConfig;
}

export async function saveSiteToDB(site: SiteConfig): Promise<void> {
  await prisma.setting.upsert({
    where: { key: SITE_KEY },
    update: { value: JSON.stringify(site) },
    create: { key: SITE_KEY, value: JSON.stringify(site) },
  });
}
