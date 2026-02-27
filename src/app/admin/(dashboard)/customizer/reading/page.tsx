"use client";

import { useState, useEffect } from "react";
import type { ReadingSettings } from "@/lib/customizer";
import styles from "../../../admin.module.css";

export default function ReadingSettingsPage() {
  const [settings, setSettings] = useState<ReadingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/customizer/reading").then((r) => r.json()).then(setSettings);
  }, []);

  function update<K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/customizer/reading", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage("Lese-Einstellungen gespeichert!");
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
        <h1 className="page-title">Lese-Einstellungen</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Inhaltsanzeige</h2>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem" }}>
            <input type="checkbox" checked={settings.showFullContent} onChange={(e) => update("showFullContent", e.target.checked)} />
            Vollständigen Inhalt in Beitragslisten anzeigen (statt Auszug)
          </label>
        </div>

        <div className="form-group">
          <label className="label">Auszug-Länge (Wörter)</label>
          <input
            className="input"
            type="number"
            min={10}
            max={200}
            value={settings.excerptLength}
            onChange={(e) => update("excerptLength", parseInt(e.target.value) || 55)}
          />
        </div>
      </div>

      <div className="card" style={{ maxWidth: "600px", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Feed-Einstellungen</h2>

        <div className="form-group">
          <label className="label">Anzahl Beiträge im Feed</label>
          <input
            className="input"
            type="number"
            min={1}
            max={100}
            value={settings.feedPostsCount}
            onChange={(e) => update("feedPostsCount", parseInt(e.target.value) || 10)}
          />
        </div>

        <div className="form-group">
          <label className="label">Feed-Inhalt</label>
          <select className="select" value={settings.feedContentType} onChange={(e) => update("feedContentType", e.target.value as "excerpt" | "full")}>
            <option value="excerpt">Auszug</option>
            <option value="full">Vollständiger Text</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "600px", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Suchmaschinen-Sichtbarkeit</h2>
        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem" }}>
            <input
              type="checkbox"
              checked={settings.searchEngineVisibility}
              onChange={(e) => update("searchEngineVisibility", e.target.checked)}
            />
            Suchmaschinen davon abhalten, diese Website zu indexieren
          </label>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
            Setzt ein noindex-Meta-Tag auf allen öffentlichen Seiten.
          </p>
        </div>
      </div>
    </>
  );
}
