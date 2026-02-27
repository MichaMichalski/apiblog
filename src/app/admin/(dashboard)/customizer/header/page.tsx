"use client";

import { useState, useEffect } from "react";
import type { HeaderBuilderConfig, HeaderBuilderRow, HeaderBuilderColumn } from "@/lib/customizer";
import { HEADER_ELEMENTS } from "@/lib/customizer";
import styles from "../../../admin.module.css";

const ROW_LABELS: Record<string, string> = {
  "top-bar": "Obere Leiste",
  "main": "Hauptleiste",
  "bottom-bar": "Untere Leiste",
};

export default function HeaderBuilderPage() {
  const [config, setConfig] = useState<HeaderBuilderConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/customizer/header").then((r) => r.json()).then(setConfig);
  }, []);

  function updateRow(rowId: string, updates: Partial<HeaderBuilderRow>) {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)),
      };
    });
  }

  function updateColumn(rowId: string, colId: string, elements: string[]) {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId
            ? { ...r, columns: r.columns.map((c) => (c.id === colId ? { ...c, elements } : c)) }
            : r
        ),
      };
    });
  }

  function addElement(rowId: string, colId: string, elementId: string) {
    const row = config?.rows.find((r) => r.id === rowId);
    const col = row?.columns.find((c) => c.id === colId);
    if (!col) return;
    updateColumn(rowId, colId, [...col.elements, elementId]);
  }

  function removeElement(rowId: string, colId: string, index: number) {
    const row = config?.rows.find((r) => r.id === rowId);
    const col = row?.columns.find((c) => c.id === colId);
    if (!col) return;
    updateColumn(rowId, colId, col.elements.filter((_, i) => i !== index));
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
      const res = await fetch("/api/v1/customizer/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) setMessage("Header-Builder gespeichert!");
      else setMessage("Speichern fehlgeschlagen.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <p>Laden...</p>;

  const usedElements = new Set(config.rows.flatMap((r) => r.columns.flatMap((c) => c.elements)));

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Header-Builder</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {config.rows.map((row) => (
          <div className="card" key={row.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.125rem", margin: 0 }}>{ROW_LABELS[row.id] || row.id}</h2>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
                />
                Aktiviert
              </label>
            </div>

            {row.enabled && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="label">Hintergrund</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="color"
                        value={row.background || "#ffffff"}
                        onChange={(e) => updateRow(row.id, { background: e.target.value })}
                        style={{ width: 36, height: 32, border: "1px solid var(--color-border)", borderRadius: 4, padding: 2, cursor: "pointer" }}
                      />
                      <input
                        className="input"
                        value={row.background}
                        onChange={(e) => updateRow(row.id, { background: e.target.value })}
                        placeholder="Leer = Standard"
                        style={{ flex: 1, fontSize: "0.8125rem" }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Textfarbe</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="color"
                        value={row.textColor || "#000000"}
                        onChange={(e) => updateRow(row.id, { textColor: e.target.value })}
                        style={{ width: 36, height: 32, border: "1px solid var(--color-border)", borderRadius: 4, padding: 2, cursor: "pointer" }}
                      />
                      <input
                        className="input"
                        value={row.textColor}
                        onChange={(e) => updateRow(row.id, { textColor: e.target.value })}
                        placeholder="Leer = Standard"
                        style={{ flex: 1, fontSize: "0.8125rem" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {row.columns.map((col) => (
                    <ColumnEditor
                      key={col.id}
                      label={col.id === "left" ? "Links" : col.id === "center" ? "Mitte" : "Rechts"}
                      column={col}
                      rowId={row.id}
                      usedElements={usedElements}
                      onAdd={(el) => addElement(row.id, col.id, el)}
                      onRemove={(idx) => removeElement(row.id, col.id, idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Element settings */}
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Element-Einstellungen</h2>
          {usedElements.has("button") && (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>Button</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label className="label">Text</label>
                  <input className="input" value={config.elementSettings?.["button"]?.text || ""} onChange={(e) => updateElementSetting("button", "text", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">URL</label>
                  <input className="input" value={config.elementSettings?.["button"]?.url || ""} onChange={(e) => updateElementSetting("button", "url", e.target.value)} />
                </div>
              </div>
            </div>
          )}
          {usedElements.has("custom-text") && (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>Benutzerdefinierter Text</h3>
              <div className="form-group">
                <label className="label">Text</label>
                <input className="input" value={config.elementSettings?.["custom-text"]?.text || ""} onChange={(e) => updateElementSetting("custom-text", "text", e.target.value)} />
              </div>
            </div>
          )}
          {usedElements.has("custom-html") && (
            <div>
              <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>Benutzerdefiniertes HTML</h3>
              <div className="form-group">
                <label className="label">HTML</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={config.elementSettings?.["custom-html"]?.html || ""}
                  onChange={(e) => updateElementSetting("custom-html", "html", e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}
                />
              </div>
            </div>
          )}
          {!usedElements.has("button") && !usedElements.has("custom-text") && !usedElements.has("custom-html") && (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Fügen Sie Button, Text oder HTML-Elemente hinzu, um deren Einstellungen hier zu konfigurieren.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function ColumnEditor({
  label,
  column,
  rowId,
  usedElements,
  onAdd,
  onRemove,
}: {
  label: string;
  column: HeaderBuilderColumn;
  rowId: string;
  usedElements: Set<string>;
  onAdd: (el: string) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "0.75rem", background: "var(--color-surface)" }}>
      <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.5rem", minHeight: "2rem" }}>
        {column.elements.map((el, idx) => {
          const elDef = HEADER_ELEMENTS.find((e) => e.id === el);
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
                onClick={() => onRemove(idx)}
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
        onChange={(e) => { if (e.target.value) onAdd(e.target.value); e.target.value = ""; }}
      >
        <option value="">+ Element...</option>
        {HEADER_ELEMENTS.map((el) => (
          <option key={el.id} value={el.id}>{el.label}</option>
        ))}
      </select>
    </div>
  );
}
