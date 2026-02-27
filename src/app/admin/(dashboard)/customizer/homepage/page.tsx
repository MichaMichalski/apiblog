"use client";

import { useState, useEffect } from "react";
import type { HomepageSettings } from "@/lib/customizer";
import styles from "../../../admin.module.css";

interface PageOption {
  id: string;
  title: string;
  slug: string;
}

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/customizer/homepage").then((r) => r.json()),
      fetch("/api/v1/pages").then((r) => r.json()),
    ]).then(([s, p]) => {
      setSettings(s);
      setPages(Array.isArray(p) ? p : p.data || []);
    });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/customizer/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage("Homepage-Einstellungen gespeichert!");
      else setMessage("Speichern fehlgeschlagen.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p>Laden...</p>;

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Homepage-Einstellungen</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Ihre Startseite zeigt</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9375rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="homepageType"
              checked={settings.type === "posts"}
              onChange={() => setSettings({ ...settings, type: "posts" })}
            />
            Ihre letzten Beiträge
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9375rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="homepageType"
              checked={settings.type === "page"}
              onChange={() => setSettings({ ...settings, type: "page" })}
            />
            Eine statische Seite
          </label>
        </div>

        {settings.type === "page" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", paddingLeft: "1.5rem" }}>
            <div className="form-group">
              <label className="label">Startseite</label>
              <select
                className="select"
                value={settings.staticPageId ?? ""}
                onChange={(e) => setSettings({ ...settings, staticPageId: e.target.value || null })}
              >
                <option value="">— Auswählen —</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Beitragsseite</label>
              <select
                className="select"
                value={settings.blogPageId ?? ""}
                onChange={(e) => setSettings({ ...settings, blogPageId: e.target.value || null })}
              >
                <option value="">— Standard (/blog) —</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
