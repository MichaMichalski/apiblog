"use client";

import { useState, useEffect } from "react";
import type { SiteConfig } from "@/lib/site";
import styles from "../../admin.module.css";

export default function SitePage() {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/site")
      .then((r) => r.json())
      .then(setSite);
  }, []);

  async function handleSave() {
    if (!site) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      if (res.ok) {
        setMessage("Website-Einstellungen gespeichert!");
      } else {
        const data = await res.json();
        setMessage(data.error || "Speichern fehlgeschlagen.");
      }
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setSite((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateSocial(key: string, value: string) {
    setSite((prev) =>
      prev ? { ...prev, social: { ...prev.social, [key]: value } } : prev
    );
  }

  function updateNavItem(index: number, field: "label" | "href", value: string) {
    setSite((prev) => {
      if (!prev) return prev;
      const nav = [...prev.navigation];
      nav[index] = { ...nav[index], [field]: value };
      return { ...prev, navigation: nav };
    });
  }

  function addNavItem() {
    setSite((prev) =>
      prev
        ? { ...prev, navigation: [...prev.navigation, { label: "", href: "/" }] }
        : prev
    );
  }

  function removeNavItem(index: number) {
    setSite((prev) => {
      if (!prev) return prev;
      const nav = prev.navigation.filter((_, i) => i !== index);
      return { ...prev, navigation: nav };
    });
  }

  function moveNavItem(index: number, direction: -1 | 1) {
    setSite((prev) => {
      if (!prev) return prev;
      const nav = [...prev.navigation];
      const target = index + direction;
      if (target < 0 || target >= nav.length) return prev;
      [nav[index], nav[target]] = [nav[target], nav[index]];
      return { ...prev, navigation: nav };
    });
  }

  if (!site) return <p>Laden...</p>;

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Website</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Allgemein</h2>
        <div className="form-group">
          <label className="label">Website-Name</label>
          <input
            className="input"
            value={site.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Beschreibung</label>
          <textarea
            className="textarea"
            value={site.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group">
            <label className="label">Logo URL</label>
            <input
              className="input"
              value={site.logo}
              onChange={(e) => updateField("logo", e.target.value)}
              placeholder="/uploads/logo.png"
            />
          </div>
          <div className="form-group">
            <label className="label">Favicon</label>
            <input
              className="input"
              value={site.favicon}
              onChange={(e) => updateField("favicon", e.target.value)}
              placeholder="/favicon.ico"
            />
          </div>
          <div className="form-group">
            <label className="label">Sprache</label>
            <select
              className="select"
              value={site.language}
              onChange={(e) => updateField("language", e.target.value)}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
              <option value="nl">Nederlands</option>
              <option value="pt">Português</option>
              <option value="pl">Polski</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Beiträge pro Seite</label>
            <input
              className="input"
              type="number"
              min={1}
              max={100}
              value={site.postsPerPage}
              onChange={(e) => updateField("postsPerPage", parseInt(e.target.value) || 10)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Navigation</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {site.navigation.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                className="input"
                value={item.label}
                onChange={(e) => updateNavItem(i, "label", e.target.value)}
                placeholder="Label"
                style={{ flex: 1 }}
              />
              <input
                className="input"
                value={item.href}
                onChange={(e) => updateNavItem(i, "href", e.target.value)}
                placeholder="/pfad"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => moveNavItem(i, -1)}
                disabled={i === 0}
                title="Nach oben"
              >
                ↑
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => moveNavItem(i, 1)}
                disabled={i === site.navigation.length - 1}
                title="Nach unten"
              >
                ↓
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeNavItem(i)}
                title="Entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn btn-secondary"
          onClick={addNavItem}
          style={{ marginTop: "0.75rem" }}
        >
          + Eintrag hinzufügen
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Footer</h2>
        <div className="form-group">
          <label className="label">Footer-Text</label>
          <input
            className="input"
            value={site.footer.text}
            onChange={(e) =>
              updateField("footer", { ...site.footer, text: e.target.value })
            }
          />
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Social Links</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group">
            <label className="label">Twitter / X</label>
            <input
              className="input"
              value={site.social.twitter}
              onChange={(e) => updateSocial("twitter", e.target.value)}
              placeholder="https://x.com/..."
            />
          </div>
          <div className="form-group">
            <label className="label">GitHub</label>
            <input
              className="input"
              value={site.social.github}
              onChange={(e) => updateSocial("github", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="form-group">
            <label className="label">LinkedIn</label>
            <input
              className="input"
              value={site.social.linkedin}
              onChange={(e) => updateSocial("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
      </div>
    </>
  );
}
