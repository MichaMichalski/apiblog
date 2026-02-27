"use client";

import { useState, useEffect } from "react";
import type { FooterBuilderConfig, FooterBuilderRow } from "@/lib/customizer";
import { FOOTER_ELEMENTS } from "@/lib/customizer";
import styles from "../../../admin.module.css";

export default function FooterBuilderPage() {
  const [config, setConfig] = useState<FooterBuilderConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/customizer/footer").then((r) => r.json()).then(setConfig);
  }, []);

  function updateRow(rowId: string, updates: Partial<FooterBuilderRow>) {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)) as FooterBuilderRow[],
      };
    });
  }

  function updateBottomBarColumn(colId: string, elements: string[]) {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => {
          if (r.id === "bottom-bar" && "columns" in r) {
            return { ...r, columns: r.columns.map((c) => (c.id === colId ? { ...c, elements } : c)) };
          }
          return r;
        }) as FooterBuilderRow[],
      };
    });
  }

  function updateElementSetting(elementId: string, key: string, value: string) {
    setConfig((prev) => {
      if (!prev) return prev;
      const elementSettings = { ...(prev.elementSettings || {}) };
      elementSettings[elementId] = { ...(elementSettings[elementId] || {}), [key]: value };
      return { ...prev, elementSettings };
    });
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/customizer/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) setMessage("Footer-Builder gespeichert!");
      else setMessage("Speichern fehlgeschlagen.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <p>Laden...</p>;

  const widgetsRow = config.rows.find((r) => r.id === "widgets") as Extract<FooterBuilderRow, { id: "widgets" }> | undefined;
  const bottomBar = config.rows.find((r) => r.id === "bottom-bar") as Extract<FooterBuilderRow, { id: "bottom-bar" }> | undefined;

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Footer-Builder</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Widget row */}
        {widgetsRow && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Widget-Bereich</h2>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={widgetsRow.enabled}
                  onChange={(e) => updateRow("widgets", { enabled: e.target.checked })}
                />
                Aktiviert
              </label>
            </div>

            {widgetsRow.enabled && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="label">Layout</label>
                  <select
                    className="select"
                    value={widgetsRow.layout}
                    onChange={(e) => updateRow("widgets", { layout: e.target.value } as Partial<FooterBuilderRow>)}
                  >
                    <option value="1-column">1 Spalte</option>
                    <option value="2-columns">2 Spalten</option>
                    <option value="3-columns">3 Spalten</option>
                    <option value="4-columns">4 Spalten</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Hintergrund</label>
                  <input className="input" value={widgetsRow.background} onChange={(e) => updateRow("widgets", { background: e.target.value })} placeholder="Leer = Standard" />
                </div>
                <div className="form-group">
                  <label className="label">Textfarbe</label>
                  <input className="input" value={widgetsRow.textColor} onChange={(e) => updateRow("widgets", { textColor: e.target.value })} placeholder="Leer = Standard" />
                </div>
                <div className="form-group">
                  <label className="label">Widget-Bereiche (kommasepariert)</label>
                  <input
                    className="input"
                    value={widgetsRow.widgetAreas.join(", ")}
                    onChange={(e) =>
                      updateRow("widgets", {
                        widgetAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      } as Partial<FooterBuilderRow>)
                    }
                    placeholder="footer-1, footer-2, footer-3"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom bar */}
        {bottomBar && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Untere Leiste</h2>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={bottomBar.enabled}
                  onChange={(e) => updateRow("bottom-bar", { enabled: e.target.checked })}
                />
                Aktiviert
              </label>
            </div>

            {bottomBar.enabled && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="label">Hintergrund</label>
                    <input className="input" value={bottomBar.background} onChange={(e) => updateRow("bottom-bar", { background: e.target.value })} placeholder="Leer = Standard" />
                  </div>
                  <div className="form-group">
                    <label className="label">Textfarbe</label>
                    <input className="input" value={bottomBar.textColor} onChange={(e) => updateRow("bottom-bar", { textColor: e.target.value })} placeholder="Leer = Standard" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {bottomBar.columns.map((col) => (
                    <div key={col.id} style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "0.75rem", background: "var(--color-surface)" }}>
                      <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {col.id === "left" ? "Links" : col.id === "center" ? "Mitte" : "Rechts"}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.5rem", minHeight: "2rem" }}>
                        {col.elements.map((el, idx) => {
                          const elDef = FOOTER_ELEMENTS.find((e) => e.id === el);
                          return (
                            <div key={`${el}-${idx}`} style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.375rem 0.5rem",
                              background: "var(--color-background)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                            }}>
                              <span>{elDef?.label || el}</span>
                              <button
                                onClick={() => updateBottomBarColumn(col.id, col.elements.filter((_, i) => i !== idx))}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", fontSize: "0.75rem" }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <select
                        className="select"
                        style={{ fontSize: "0.8125rem" }}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) updateBottomBarColumn(col.id, [...col.elements, e.target.value]);
                          e.target.value = "";
                        }}
                      >
                        <option value="">+ Element...</option>
                        {FOOTER_ELEMENTS.map((el) => (
                          <option key={el.id} value={el.id}>{el.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Element settings */}
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Element-Einstellungen</h2>
          <div className="form-group">
            <label className="label">Copyright-Text</label>
            <input
              className="input"
              value={config.elementSettings?.["copyright"]?.text || ""}
              onChange={(e) => updateElementSetting("copyright", "text", e.target.value)}
              placeholder="Leer = Footer-Text aus Website-Einstellungen"
            />
          </div>
          <div className="form-group">
            <label className="label">Benutzerdefinierter Text</label>
            <input
              className="input"
              value={config.elementSettings?.["custom-text"]?.text || ""}
              onChange={(e) => updateElementSetting("custom-text", "text", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Benutzerdefiniertes HTML</label>
            <textarea
              className="textarea"
              rows={3}
              value={config.elementSettings?.["custom-html"]?.html || ""}
              onChange={(e) => updateElementSetting("custom-html", "html", e.target.value)}
              style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
