"use client";

import { useState, useEffect } from "react";
import type { WidgetArea, Widget, WidgetType } from "@/lib/widgets";
import { WIDGET_TYPE_LABELS, getDefaultWidgetSettings } from "@/lib/widgets";
import styles from "../../admin.module.css";

function generateId(): string {
  return "w_" + Math.random().toString(36).slice(2, 10);
}

const ALL_WIDGET_TYPES: WidgetType[] = [
  "text", "recent-posts", "search", "custom-html", "social-links", "newsletter", "categories", "tag-cloud",
];

export default function WidgetsPage() {
  const [areas, setAreas] = useState<WidgetArea[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/widget-areas").then((r) => r.json()),
      fetch("/api/v1/widgets").then((r) => r.json()),
    ]).then(([a, w]) => {
      setAreas(a);
      setWidgets(w);
    });
  }, []);

  function getAreaWidgets(areaId: string): Widget[] {
    return widgets
      .filter((w) => w.areaId === areaId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function addWidget(areaId: string, type: WidgetType) {
    const newWidget: Widget = {
      id: generateId(),
      type,
      areaId,
      sortOrder: getAreaWidgets(areaId).length,
      settings: getDefaultWidgetSettings(type),
    };
    setWidgets((prev) => [...prev, newWidget]);
    setExpandedWidget(newWidget.id);
  }

  function updateWidget(id: string, updates: Partial<Widget>) {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }

  function updateWidgetSetting(id: string, key: string, value: unknown) {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, settings: { ...w.settings, [key]: value } } : w
      )
    );
  }

  function removeWidget(id: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }

  function moveWidget(id: string, direction: -1 | 1) {
    setWidgets((prev) => {
      const widget = prev.find((w) => w.id === id);
      if (!widget) return prev;
      const areaWidgets = prev
        .filter((w) => w.areaId === widget.areaId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = areaWidgets.findIndex((w) => w.id === id);
      const target = idx + direction;
      if (target < 0 || target >= areaWidgets.length) return prev;
      const swapId = areaWidgets[target].id;
      return prev.map((w) => {
        if (w.id === id) return { ...w, sortOrder: areaWidgets[target].sortOrder };
        if (w.id === swapId) return { ...w, sortOrder: areaWidgets[idx].sortOrder };
        return w;
      });
    });
  }

  function moveWidgetToArea(widgetId: string, newAreaId: string) {
    setWidgets((prev) => {
      const existing = prev.filter((w) => w.areaId === newAreaId);
      return prev.map((w) =>
        w.id === widgetId ? { ...w, areaId: newAreaId, sortOrder: existing.length } : w
      );
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await fetch("/api/v1/widget-areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(areas),
      });

      const existing: Widget[] = await fetch("/api/v1/widgets").then((r) => r.json());

      for (const widget of widgets) {
        const exists = existing.some((w) => w.id === widget.id);
        if (exists) {
          await fetch(`/api/v1/widgets/${widget.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(widget),
          });
        } else {
          await fetch("/api/v1/widgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(widget),
          });
        }
      }

      for (const ex of existing) {
        if (!widgets.some((w) => w.id === ex.id)) {
          await fetch(`/api/v1/widgets/${ex.id}`, { method: "DELETE" });
        }
      }

      setMessage("Widgets gespeichert!");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Widgets</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {areas.map((area) => {
          const areaWidgets = getAreaWidgets(area.id);
          return (
            <div className="card" key={area.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.125rem", margin: 0 }}>{area.name}</h2>
                  {area.description && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
                      {area.description}
                    </p>
                  )}
                </div>
                <select
                  className="select"
                  style={{ width: "auto" }}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addWidget(area.id, e.target.value as WidgetType);
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Widget hinzufügen...</option>
                  {ALL_WIDGET_TYPES.map((type) => (
                    <option key={type} value={type}>{WIDGET_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              {areaWidgets.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "1rem 0" }}>
                  Keine Widgets in diesem Bereich.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {areaWidgets.map((widget, idx) => (
                    <WidgetEditor
                      key={widget.id}
                      widget={widget}
                      index={idx}
                      total={areaWidgets.length}
                      areas={areas}
                      expanded={expandedWidget === widget.id}
                      onToggle={() => setExpandedWidget(expandedWidget === widget.id ? null : widget.id)}
                      onUpdate={updateWidget}
                      onUpdateSetting={updateWidgetSetting}
                      onRemove={removeWidget}
                      onMove={moveWidget}
                      onMoveToArea={moveWidgetToArea}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

interface WidgetEditorProps {
  widget: Widget;
  index: number;
  total: number;
  areas: WidgetArea[];
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
  onUpdateSetting: (id: string, key: string, value: unknown) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onMoveToArea: (id: string, areaId: string) => void;
}

function WidgetEditor({ widget, index, total, areas, expanded, onToggle, onUpdateSetting, onRemove, onMove, onMoveToArea }: WidgetEditorProps) {
  const s = widget.settings as Record<string, unknown>;

  return (
    <div style={{
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      background: "var(--color-surface)",
    }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem 0.75rem",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{expanded ? "▼" : "▶"}</span>
        <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500 }}>
          {(s.title as string) || WIDGET_TYPE_LABELS[widget.type]}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600 }}>
          {WIDGET_TYPE_LABELS[widget.type]}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "0 0.75rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {widget.type === "text" && (
            <>
              <div className="form-group">
                <label className="label">Titel</label>
                <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Inhalt (HTML)</label>
                <textarea className="textarea" rows={4} value={(s.content as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "content", e.target.value)} />
              </div>
            </>
          )}

          {widget.type === "recent-posts" && (
            <>
              <div className="form-group">
                <label className="label">Titel</label>
                <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label className="label">Anzahl</label>
                  <input className="input" type="number" min={1} max={20} value={(s.count as number) || 5} onChange={(e) => onUpdateSetting(widget.id, "count", parseInt(e.target.value) || 5)} />
                </div>
                <div className="form-group">
                  <label className="label">Datum anzeigen</label>
                  <select className="select" value={s.showDate ? "true" : "false"} onChange={(e) => onUpdateSetting(widget.id, "showDate", e.target.value === "true")}>
                    <option value="true">Ja</option>
                    <option value="false">Nein</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Bild anzeigen</label>
                <select className="select" value={s.showImage ? "true" : "false"} onChange={(e) => onUpdateSetting(widget.id, "showImage", e.target.value === "true")}>
                  <option value="true">Ja</option>
                  <option value="false">Nein</option>
                </select>
              </div>
            </>
          )}

          {widget.type === "search" && (
            <>
              <div className="form-group">
                <label className="label">Titel</label>
                <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Platzhalter</label>
                <input className="input" value={(s.placeholder as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "placeholder", e.target.value)} />
              </div>
            </>
          )}

          {widget.type === "custom-html" && (
            <div className="form-group">
              <label className="label">HTML-Code</label>
              <textarea className="textarea" rows={6} value={(s.content as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "content", e.target.value)} style={{ fontFamily: "monospace", fontSize: "0.8125rem" }} />
            </div>
          )}

          {widget.type === "social-links" && (
            <>
              <div className="form-group">
                <label className="label">Titel</label>
                <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
              </div>
              <SocialLinksEditor
                links={(s.links as { platform: string; url: string }[]) || []}
                onChange={(links) => onUpdateSetting(widget.id, "links", links)}
              />
            </>
          )}

          {widget.type === "newsletter" && (
            <>
              <div className="form-group">
                <label className="label">Titel</label>
                <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Beschreibung</label>
                <textarea className="textarea" rows={2} value={(s.description as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "description", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Formular-Action URL</label>
                <input className="input" value={(s.action as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "action", e.target.value)} placeholder="https://..." />
              </div>
            </>
          )}

          {(widget.type === "categories" || widget.type === "tag-cloud") && (
            <div className="form-group">
              <label className="label">Titel</label>
              <input className="input" value={(s.title as string) || ""} onChange={(e) => onUpdateSetting(widget.id, "title", e.target.value)} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem", alignItems: "end" }}>
            <div className="form-group">
              <label className="label">Verschieben nach</label>
              <select className="select" value={widget.areaId} onChange={(e) => onMoveToArea(widget.id, e.target.value)}>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => onMove(widget.id, -1)} disabled={index === 0}>↑</button>
              <button className="btn btn-secondary btn-sm" onClick={() => onMove(widget.id, 1)} disabled={index === total - 1}>↓</button>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(widget.id)}>Entfernen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SocialLinksEditor({ links, onChange }: { links: { platform: string; url: string }[]; onChange: (links: { platform: string; url: string }[]) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {links.map((link, i) => (
        <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            className="select"
            value={link.platform}
            onChange={(e) => {
              const updated = [...links];
              updated[i] = { ...updated[i], platform: e.target.value };
              onChange(updated);
            }}
            style={{ width: "140px" }}
          >
            {["Twitter", "GitHub", "LinkedIn", "Facebook", "Instagram", "YouTube", "Mastodon", "TikTok"].map((p) => (
              <option key={p} value={p.toLowerCase()}>{p}</option>
            ))}
          </select>
          <input
            className="input"
            value={link.url}
            onChange={(e) => {
              const updated = [...links];
              updated[i] = { ...updated[i], url: e.target.value };
              onChange(updated);
            }}
            placeholder="https://..."
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onChange(links.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onChange([...links, { platform: "twitter", url: "" }])}
      >
        + Link hinzufügen
      </button>
    </div>
  );
}
