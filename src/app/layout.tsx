import type { Metadata } from "next";
import { getThemeFromDB, getFontImportUrl, themeToCSS } from "@/lib/theme";
import ThemeProvider from "@/components/theme/ThemeProvider";
import CookieConsent from "@/components/consent/CookieConsent";
import ScriptLoader from "@/components/consent/ScriptLoader";
import siteConfig from "@/config/site.json";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getThemeFromDB();
  const fontUrl = getFontImportUrl(theme);
  const cssVars = themeToCSS(theme);

  return (
    <html lang={siteConfig.language}>
      <head>
        {fontUrl && <link rel="stylesheet" href={fontUrl} />}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
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
