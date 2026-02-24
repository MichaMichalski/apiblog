import Link from "next/link";
import siteConfig from "@/config/site.json";
import styles from "./public.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          {siteConfig.name}
        </Link>
        <nav className={styles.nav}>
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
