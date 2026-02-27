import Link from "next/link";
import { getSiteFromDB } from "@/lib/site";
import { getMenuForLocation } from "@/lib/menus";
import { getFooterBuilder, type FooterBuilderConfig } from "@/lib/customizer";
import WidgetArea from "@/components/widgets/WidgetArea";
import styles from "./public.module.css";

export default async function Footer() {
  const [site, footerConfig, footerMenu] = await Promise.all([
    getSiteFromDB(),
    getFooterBuilder(),
    getMenuForLocation("footer"),
  ]);

  const elSettings = footerConfig.elementSettings ?? {};
  const enabledRows = footerConfig.rows.filter((r) => r.enabled);

  function renderElement(elementId: string) {
    switch (elementId) {
      case "copyright":
        return (
          <span key="copyright" className={styles.footerCopyright}>
            {elSettings["copyright"]?.text || site.footer.text}
          </span>
        );
      case "footer-menu":
        if (!footerMenu || footerMenu.items.length === 0) return null;
        return (
          <nav key="footer-menu" className={styles.footerNav}>
            {footerMenu.items
              .filter((i) => !i.parentId)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <Link key={item.id} href={item.url} className={styles.footerLink} target={item.target}>
                  {item.label}
                </Link>
              ))}
          </nav>
        );
      case "social-icons":
        return (
          <div key="social" className={styles.footerSocial}>
            {site.social.twitter && <a href={site.social.twitter} target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>X</a>}
            {site.social.github && <a href={site.social.github} target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>GH</a>}
            {site.social.linkedin && <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>in</a>}
          </div>
        );
      case "custom-text": {
        const s = elSettings["custom-text"] ?? {};
        return <span key="custom-text">{s.text || ""}</span>;
      }
      case "custom-html": {
        const s = elSettings["custom-html"] ?? {};
        return <span key="custom-html" dangerouslySetInnerHTML={{ __html: s.html || "" }} />;
      }
      default:
        return null;
    }
  }

  if (enabledRows.length === 0) {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {footerMenu && footerMenu.items.length > 0 && (
            <nav className={styles.footerNav}>
              {footerMenu.items
                .filter((i) => !i.parentId)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <Link key={item.id} href={item.url} className={styles.footerLink} target={item.target}>
                    {item.label}
                  </Link>
                ))}
            </nav>
          )}
          <p>{site.footer.text}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      {enabledRows.map((row) => {
        const rowStyle: React.CSSProperties = {};
        if (row.background) rowStyle.background = row.background;
        if (row.textColor) rowStyle.color = row.textColor;

        if (row.id === "widgets" && "widgetAreas" in row) {
          const layoutMap: Record<string, string> = {
            "1-column": "1fr",
            "2-columns": "1fr 1fr",
            "3-columns": "1fr 1fr 1fr",
            "4-columns": "1fr 1fr 1fr 1fr",
          };
          return (
            <div key={row.id} className={styles.footerWidgetRow} style={rowStyle}>
              <div className={styles.footerWidgetGrid} style={{ gridTemplateColumns: layoutMap[row.layout] || "1fr 1fr 1fr" }}>
                {row.widgetAreas.map((areaId) => (
                  <WidgetArea key={areaId} areaId={areaId} />
                ))}
              </div>
            </div>
          );
        }

        if (row.id === "bottom-bar" && "columns" in row) {
          return (
            <div key={row.id} className={styles.footerBottomBar} style={rowStyle}>
              <div className={styles.footerBottomBarInner}>
                {row.columns.map((col) => (
                  <div key={col.id} className={styles[`footerCol${col.id.charAt(0).toUpperCase() + col.id.slice(1)}` as keyof typeof styles] || ""}>
                    {col.elements.map((el) => renderElement(el))}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </footer>
  );
}
