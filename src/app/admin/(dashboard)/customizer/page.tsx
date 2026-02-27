"use client";

import Link from "next/link";
import styles from "../../admin.module.css";

const sections = [
  { href: "/admin/customizer/header", label: "Header-Builder", description: "Zeilen und Elemente des Headers konfigurieren", icon: "🏗️" },
  { href: "/admin/customizer/footer", label: "Footer-Builder", description: "Footer-Layout mit Widgets und Elementen gestalten", icon: "🦶" },
  { href: "/admin/customizer/homepage", label: "Homepage", description: "Startseite: Letzte Beiträge oder statische Seite", icon: "🏠" },
  { href: "/admin/customizer/blog-layout", label: "Blog-Layout", description: "Grid, Liste, Spalten, Auszüge und Paginierung", icon: "📰" },
  { href: "/admin/customizer/reading", label: "Lesen", description: "Auszugslänge, Feed-Einstellungen, Sichtbarkeit", icon: "📖" },
  { href: "/admin/customizer/css", label: "Zusätzliches CSS", description: "Eigenen CSS-Code hinzufügen", icon: "🎨" },
];

export default function CustomizerPage() {
  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Customizer</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{
              display: "block",
              padding: "1.5rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--card-border-radius)",
              textDecoration: "none",
              color: "var(--color-text)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{section.icon}</div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.375rem" }}>{section.label}</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
