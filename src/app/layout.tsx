import type { Metadata } from "next";
import { getThemeFromDB, getFontImportUrl, themeToCSS } from "@/lib/theme";
import { getSiteFromDB } from "@/lib/site";
import { getCustomCSS } from "@/lib/customizer";
import ThemeProvider from "@/components/theme/ThemeProvider";
import CookieConsent from "@/components/consent/CookieConsent";
import ScriptLoader from "@/components/consent/ScriptLoader";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteFromDB();
  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, site, customCss] = await Promise.all([
    getThemeFromDB(),
    getSiteFromDB(),
    getCustomCSS(),
  ]);
  const fontUrl = getFontImportUrl(theme);
  const cssVars = themeToCSS(theme);

  return (
    <html lang={site.language}>
      <head>
        {fontUrl && <link rel="stylesheet" href={fontUrl} />}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {customCss.css && <style dangerouslySetInnerHTML={{ __html: customCss.css }} />}
      </head>
      <body>
        <ThemeProvider theme={theme}>
          {children}
          <CookieConsent />
          <ScriptLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
