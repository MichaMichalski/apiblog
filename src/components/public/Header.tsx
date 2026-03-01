import Link from "next/link";
import { getSiteFromDB } from "@/lib/site";
import { getMenuForLocation, buildMenuTree } from "@/lib/menus";
import { getHeaderBuilder, type HeaderBuilderRow, type HeaderBuilderColumn } from "@/lib/customizer";
import MobileMenuToggle from "./MobileMenuToggle";
import styles from "./public.module.css";

export default async function Header() {
  const [site, headerConfig, primaryMenu, secondaryMenu] = await Promise.all([
    getSiteFromDB(),
    getHeaderBuilder(),
    getMenuForLocation("header"),
    getMenuForLocation("footer"),
  ]);

  const primaryTree = primaryMenu ? buildMenuTree(primaryMenu.items) : [];
  const secondaryItems = secondaryMenu?.items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  const fallbackNav = site.navigation.map((item) => ({
    label: item.label, href: item.href, target: "_self" as const, children: [] as { id: string; label: string; url: string; target: string }[],
  }));
  const navItems = primaryTree.length > 0
    ? primaryTree.map((item) => ({ label: item.label, href: item.url, target: item.target, children: item.children }))
    : fallbackNav;

  const enabledRows = headerConfig.rows.filter((r) => r.enabled);
  const elSettings = headerConfig.elementSettings ?? {};

  function renderElement(elementId: string) {
    switch (elementId) {
      case "logo":
        return (
          <Link href="/" className={styles.logo} key="logo">
            {site.logo ? <img src={site.logo} alt={site.name} style={{ height: "2rem" }} /> : site.name}
          </Link>
        );
      case "primary-menu":
        return (
          <nav className={`${styles.nav} ${styles.desktopOnly}`} key="primary-menu" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <div key={item.href} className={styles.navItem}>
                <Link href={item.href} className={styles.navLink} target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                  {item.label}
                </Link>
                {item.children.length > 0 && (
                  <div className={styles.navDropdown}>
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.url} className={styles.navDropdownLink} target={child.target}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        );
      case "secondary-menu":
        return (
          <nav className={`${styles.nav} ${styles.desktopOnly}`} key="secondary-menu" aria-label="Zusätzliche Navigation">
            {secondaryItems.map((item) => (
              <Link key={item.id} href={item.url} className={styles.navLink} target={item.target}>
                {item.label}
              </Link>
            ))}
          </nav>
        );
      case "search-toggle":
        return (
          <form key="search" action="/blog" method="get" className={styles.headerSearch}>
            <input type="search" name="q" placeholder="Suchen..." className={styles.headerSearchInput} />
          </form>
        );
      case "social-icons":
        return (
          <div key="social" className={styles.headerSocial}>
            {site.social.twitter && <a href={site.social.twitter} target="_blank" rel="noopener noreferrer" className={styles.headerSocialLink}>X</a>}
            {site.social.github && <a href={site.social.github} target="_blank" rel="noopener noreferrer" className={styles.headerSocialLink}>GH</a>}
            {site.social.linkedin && <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className={styles.headerSocialLink}>in</a>}
          </div>
        );
      case "button": {
        const s = elSettings["button"] ?? {};
        return (
          <Link key="button" href={s.url || "#"} className={styles.headerButton}>
            {s.text || "Button"}
          </Link>
        );
      }
      case "custom-text": {
        const s = elSettings["custom-text"] ?? {};
        return <span key="custom-text" className={styles.headerCustomText}>{s.text || ""}</span>;
      }
      case "custom-html": {
        const s = elSettings["custom-html"] ?? {};
        return <span key="custom-html" dangerouslySetInnerHTML={{ __html: s.html || "" }} />;
      }
      default:
        return null;
    }
  }

  function renderColumn(col: HeaderBuilderColumn) {
    if (col.elements.length === 0) return null;
    return (
      <div className={styles[`headerCol${col.id.charAt(0).toUpperCase() + col.id.slice(1)}` as keyof typeof styles] ?? styles.headerColLeft}>
        {col.elements.map((el) => renderElement(el))}
      </div>
    );
  }

  function renderRow(row: HeaderBuilderRow) {
    const rowStyle: React.CSSProperties = {};
    if (row.background) rowStyle.background = row.background;
    if (row.textColor) rowStyle.color = row.textColor;

    return (
      <div key={row.id} className={`${styles.headerRow} ${row.id === "main" ? styles.headerRowMain : styles.headerRowBar}`} style={rowStyle}>
        <div className={styles.headerRowInner}>
          {row.columns.map((col) => (
            <div key={col.id} className={styles[`headerCol${col.id.charAt(0).toUpperCase() + col.id.slice(1)}` as keyof typeof styles] || ""}>
              {col.elements.map((el) => renderElement(el))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mobileNavContent = (
    <nav aria-label="Mobile Navigation">
      {navItems.map((item) => (
        <div key={item.href} className={styles.mobileNavItem}>
          <Link href={item.href} className={styles.mobileNavLink} target={item.target}>
            {item.label}
          </Link>
          {item.children.length > 0 && (
            <div className={styles.mobileNavSub}>
              {item.children.map((child) => (
                <Link key={child.id} href={child.url} className={styles.mobileNavLink} target={child.target}>
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      {secondaryItems.length > 0 && (
        <div className={styles.mobileNavDivider} />
      )}
      {secondaryItems.map((item) => (
        <Link key={item.id} href={item.url} className={styles.mobileNavLink} target={item.target}>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  if (enabledRows.length === 0) {
    return (
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            {site.logo ? <img src={site.logo} alt={site.name} style={{ height: "2rem" }} /> : site.name}
          </Link>
          <nav className={`${styles.nav} ${styles.desktopOnly}`} aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <div key={item.href} className={styles.navItem}>
                <Link href={item.href} className={styles.navLink} target={item.target}>
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>
          <MobileMenuToggle>{mobileNavContent}</MobileMenuToggle>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      {enabledRows.map((row) => renderRow(row))}
      <MobileMenuToggle>{mobileNavContent}</MobileMenuToggle>
    </header>
  );
}
