"use client";

import { useState, useEffect } from "react";
import type { BlogLayout } from "@/lib/customizer";
import styles from "../../../admin.module.css";

export default function BlogLayoutPage() {
  const [layout, setLayout] = useState<BlogLayout | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/customizer/blog-layout").then((r) => r.json()).then(setLayout);
  }, []);

  function update<K extends keyof BlogLayout>(key: K, value: BlogLayout[K]) {
    setLayout((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!layout) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/customizer/blog-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      if (res.ok) setMessage("Blog-Layout gespeichert!");
      else setMessage("Speichern fehlgeschlagen.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (!layout) return <p>Laden...</p>;

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Blog-Layout</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "800px" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Layout</h2>
          <div className="form-group">
            <label className="label">Darstellung</label>
            <select className="select" value={layout.layout} onChange={(e) => update("layout", e.target.value as BlogLayout["layout"])}>
              <option value="grid">Grid</option>
              <option value="list">Liste</option>
              <option value="masonry">Masonry</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Spalten (Grid/Masonry)</label>
            <select className="select" value={layout.columns} onChange={(e) => update("columns", parseInt(e.target.value))}>
              <option value="2">2 Spalten</option>
              <option value="3">3 Spalten</option>
              <option value="4">4 Spalten</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Beiträge pro Seite</label>
            <input className="input" type="number" min={1} max={100} value={layout.postsPerPage} onChange={(e) => update("postsPerPage", parseInt(e.target.value) || 10)} />
          </div>
          <div className="form-group">
            <label className="label">Paginierung</label>
            <select className="select" value={layout.pagination} onChange={(e) => update("pagination", e.target.value as BlogLayout["pagination"])}>
              <option value="numbered">Nummeriert</option>
              <option value="load-more">Mehr laden</option>
              <option value="infinite">Unendlich scrollen</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Anzeige</h2>
          {([
            ["showFeaturedImage", "Beitragsbild anzeigen"],
            ["showExcerpt", "Auszug anzeigen"],
            ["showAuthor", "Autor anzeigen"],
            ["showDate", "Datum anzeigen"],
            ["showReadMore", "\"Weiterlesen\" anzeigen"],
          ] as const).map(([key, label]) => (
            <div className="form-group" key={key}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={layout[key]} onChange={(e) => update(key, e.target.checked)} />
                {label}
              </label>
            </div>
          ))}
          <div className="form-group">
            <label className="label">Auszug-Länge (Zeichen)</label>
            <input className="input" type="number" min={50} max={500} value={layout.excerptLength} onChange={(e) => update("excerptLength", parseInt(e.target.value) || 150)} />
          </div>
          <div className="form-group">
            <label className="label">&quot;Weiterlesen&quot;-Text</label>
            <input className="input" value={layout.readMoreText} onChange={(e) => update("readMoreText", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Sidebar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={layout.sidebarEnabled} onChange={(e) => update("sidebarEnabled", e.target.checked)} />
                Sidebar aktivieren
              </label>
            </div>
            {layout.sidebarEnabled && (
              <div className="form-group">
                <label className="label">Position</label>
                <select className="select" value={layout.sidebarPosition} onChange={(e) => update("sidebarPosition", e.target.value as "left" | "right")}>
                  <option value="right">Rechts</option>
                  <option value="left">Links</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
