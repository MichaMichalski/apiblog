"use client";

import { useState, useEffect } from "react";
import type { ThemeConfig } from "@/lib/theme";
import styles from "../../admin.module.css";

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/theme")
      .then((r) => r.json())
      .then(setTheme);
  }, []);

  async function handleSave() {
    if (!theme) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });

      if (res.ok) {
        setMessage("Theme gespeichert! Laden Sie die Seite neu, um Änderungen zu sehen.");
      } else {
        setMessage("Speichern fehlgeschlagen.");
      }
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function loadPreset(presetName: string) {
    try {
      const res = await fetch(`/themes/${presetName}.json`);
      if (res.ok) {
        const preset = await res.json();
        setTheme(preset);
        setMessage(`Preset "${presetName}" geladen. Klicken Sie "Speichern" um es anzuwenden.`);
      }
    } catch {
      setMessage("Preset konnte nicht geladen werden.");
    }
  }

  if (!theme) return <p>Laden...</p>;

  function updateColor(key: string, value: string) {
    setTheme((prev) => prev ? { ...prev, colors: { ...prev.colors, [key]: value } } : prev);
  }

  function updateFont(key: string, field: "family" | "weight", value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fonts: { ...prev.fonts, [key]: { ...prev.fonts[key], [field]: value } },
      };
    });
  }

  function updateLayout(key: string, value: string) {
    setTheme((prev) => prev ? { ...prev, layout: { ...prev.layout, [key]: value } } : prev);
  }

  function updateSpacing(key: string, value: string) {
    setTheme((prev) => prev ? { ...prev, spacing: { ...prev.spacing, [key]: value } } : prev);
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Theme</h1>
        <div className="actions">
          <select
            className="select"
            onChange={(e) => { if (e.target.value) loadPreset(e.target.value); e.target.value = ""; }}
            style={{ width: "auto" }}
          >
            <option value="">Preset laden...</option>
            <option value="default">Default</option>
            <option value="minimal">Minimal</option>
            <option value="bold">Bold</option>
          </select>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Farben</h2>
        <div className={styles.themeColorGrid}>
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className={styles.colorField}>
              <input
                type="color"
                value={value}
                onChange={(e) => updateColor(key, e.target.value)}
              />
              <div>
                <div className={styles.colorLabel}>{key}</div>
                <input
                  className="input"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  style={{ width: "100px", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Schriften</h2>
        {Object.entries(theme.fonts).map(([key, font]) => (
          <div key={key} className="form-group" style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <label className="label">{key} - Familie</label>
              <input
                className="input"
                value={font.family}
                onChange={(e) => updateFont(key, "family", e.target.value)}
              />
            </div>
            <div style={{ width: "100px" }}>
              <label className="label">Gewicht</label>
              <input
                className="input"
                value={font.weight}
                onChange={(e) => updateFont(key, "weight", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Layout</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {Object.entries(theme.layout).map(([key, value]) => (
            <div key={key} className="form-group">
              <label className="label">{key}</label>
              <input
                className="input"
                value={value}
                onChange={(e) => updateLayout(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Abstände</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {Object.entries(theme.spacing).map(([key, value]) => (
            <div key={key} className="form-group">
              <label className="label">{key}</label>
              <input
                className="input"
                value={value}
                onChange={(e) => updateSpacing(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
