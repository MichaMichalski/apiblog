import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getSiteFromDB, saveSiteToDB } from "@/lib/site";
import { getThemeFromDB, saveThemeToDB } from "@/lib/theme";
import {
  getHeaderBuilder,
  saveHeaderBuilder,
  getFooterBuilder,
  saveFooterBuilder,
  getHomepageSettings,
  saveHomepageSettings,
  getBlogLayout,
  saveBlogLayout,
  getReadingSettings,
  saveReadingSettings,
  getCustomCSS,
  saveCustomCSS,
} from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const [site, theme, header, footer, homepage, blogLayout, reading, css] =
      await Promise.all([
        getSiteFromDB(),
        getThemeFromDB(),
        getHeaderBuilder(),
        getFooterBuilder(),
        getHomepageSettings(),
        getBlogLayout(),
        getReadingSettings(),
        getCustomCSS(),
      ]);

    await Promise.all([
      saveSiteToDB(site),
      saveThemeToDB(theme),
      saveHeaderBuilder(header),
      saveFooterBuilder(footer),
      saveHomepageSettings(homepage),
      saveBlogLayout(blogLayout),
      saveReadingSettings(reading),
      saveCustomCSS(css),
    ]);

    revalidateAll();

    return NextResponse.json({
      success: true,
      message: "All settings re-saved and pages revalidated",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
