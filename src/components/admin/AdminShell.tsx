"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import styles from "@/app/admin/admin.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/posts", label: "Beiträge", icon: "📝" },
  { href: "/admin/pages", label: "Seiten", icon: "📄" },
  { href: "/admin/media", label: "Medien", icon: "🖼️" },
  { href: "/admin/menus", label: "Menüs", icon: "☰" },
  { href: "/admin/widgets", label: "Widgets", icon: "🧩" },
  { href: "/admin/redirects", label: "Weiterleitungen", icon: "↪" },
  { href: "/admin/site", label: "Website", icon: "🌐" },
  { href: "/admin/theme", label: "Theme", icon: "🎨" },
  { href: "/admin/customizer", label: "Customizer", icon: "⚙️" },
  { href: "/admin/settings", label: "Einstellungen", icon: "🔧" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Link href="/admin">CMS Admin</Link>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarLink} target="_blank">
            Website ansehen
          </Link>
          <button onClick={handleLogout} className={styles.sidebarLink} style={{ width: "100%", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
            Abmelden
          </button>
        </div>
      </aside>
      <div className={styles.mainContent}>{children}</div>
    </>
  );
}
