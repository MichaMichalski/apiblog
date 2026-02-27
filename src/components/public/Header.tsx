import Link from "next/link";
import { getSiteFromDB } from "@/lib/site";
import styles from "./public.module.css";

export default async function Header() {
  const site = await getSiteFromDB();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          {site.name}
        </Link>
        <nav className={styles.nav}>
          {site.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
