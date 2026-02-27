"use client";

import { useState, useEffect } from "react";
import type { Menu, MenuItem, MenuLocations } from "@/lib/menus";
import styles from "../../admin.module.css";

function generateId(): string {
  return "mi_" + Math.random().toString(36).slice(2, 10);
}

function emptyItem(): MenuItem {
  return { id: generateId(), label: "", url: "/", type: "custom", parentId: null, sortOrder: 0, target: "_self", cssClass: "" };
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [locations, setLocations] = useState<MenuLocations>({ header: null, footer: null, mobile: null });
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/menus").then((r) => r.json()),
      fetch("/api/v1/menu-locations").then((r) => r.json()),
    ]).then(([m, l]) => {
      setMenus(m);
      setLocations(l);
      if (m.length > 0) setSelectedMenuId(m[0].id);
    });
  }, []);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId) ?? null;

  function updateMenu(updated: Menu) {
    setMenus((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function addMenu() {
    const id = "menu_" + Math.random().toString(36).slice(2, 8);
    const newMenu: Menu = { id, name: "Neues Menü", items: [] };
    setMenus((prev) => [...prev, newMenu]);
    setSelectedMenuId(id);
  }

  function deleteMenu(id: string) {
    if (!confirm("Menü wirklich löschen?")) return;
    setMenus((prev) => prev.filter((m) => m.id !== id));
    if (selectedMenuId === id) {
      setSelectedMenuId(menus.find((m) => m.id !== id)?.id ?? null);
    }
  }

  function addItem() {
    if (!selectedMenu) return;
    const item = emptyItem();
    item.sortOrder = selectedMenu.items.length;
    updateMenu({ ...selectedMenu, items: [...selectedMenu.items, item] });
  }

  function updateItem(itemId: string, updates: Partial<MenuItem>) {
    if (!selectedMenu) return;
    updateMenu({
      ...selectedMenu,
      items: selectedMenu.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    });
  }

  function removeItem(itemId: string) {
    if (!selectedMenu) return;
    updateMenu({
      ...selectedMenu,
      items: selectedMenu.items
        .filter((i) => i.id !== itemId)
        .map((i) => (i.parentId === itemId ? { ...i, parentId: null } : i)),
    });
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    if (!selectedMenu) return;
    const items = [...selectedMenu.items];
    const idx = items.findIndex((i) => i.id === itemId);
    const target = idx + direction;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    items.forEach((item, i) => (item.sortOrder = i));
    updateMenu({ ...selectedMenu, items });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/menus", { method: "GET" });
      const existingMenus: Menu[] = await res.json();

      for (const menu of menus) {
        const exists = existingMenus.some((m) => m.id === menu.id);
        if (exists) {
          await fetch(`/api/v1/menus/${menu.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(menu),
          });
        } else {
          await fetch("/api/v1/menus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(menu),
          });
        }
      }

      for (const existing of existingMenus) {
        if (!menus.some((m) => m.id === existing.id)) {
          await fetch(`/api/v1/menus/${existing.id}`, { method: "DELETE" });
        }
      }

      await fetch("/api/v1/menu-locations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locations),
      });

      setMessage("Menüs gespeichert!");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  const topLevelItems = selectedMenu?.items.filter((i) => !i.parentId) ?? [];
  const getChildren = (parentId: string) =>
    selectedMenu?.items.filter((i) => i.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Menüs</h1>
        <div className="actions">
          <button className="btn btn-secondary" onClick={addMenu}>+ Neues Menü</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Sidebar: Menu list + Locations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Menüs</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    background: selectedMenuId === menu.id ? "var(--color-primary)" : "transparent",
                    color: selectedMenuId === menu.id ? "#fff" : "var(--color-text)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                  onClick={() => setSelectedMenuId(menu.id)}
                >
                  <span style={{ flex: 1 }}>{menu.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMenu(menu.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "0.75rem" }}
                    title="Löschen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Positionen</h2>
            {(["header", "footer", "mobile"] as const).map((loc) => (
              <div className="form-group" key={loc}>
                <label className="label">{loc === "header" ? "Header" : loc === "footer" ? "Footer" : "Mobil"}</label>
                <select
                  className="select"
                  value={locations[loc] ?? ""}
                  onChange={(e) => setLocations((prev) => ({ ...prev, [loc]: e.target.value || null }))}
                >
                  <option value="">— Kein Menü —</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Menu editor */}
        <div>
          {selectedMenu ? (
            <div className="card">
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="label">Menü-Name</label>
                <input
                  className="input"
                  value={selectedMenu.name}
                  onChange={(e) => updateMenu({ ...selectedMenu, name: e.target.value })}
                />
              </div>

              <h3 style={{ fontSize: "0.9375rem", marginBottom: "1rem" }}>Menüeinträge</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {topLevelItems.sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx) => (
                  <div key={item.id}>
                    <MenuItemEditor
                      item={item}
                      index={idx}
                      total={topLevelItems.length}
                      allItems={selectedMenu.items}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                      onMove={moveItem}
                    />
                    {getChildren(item.id).map((child) => (
                      <div key={child.id} style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
                        <MenuItemEditor
                          item={child}
                          index={0}
                          total={1}
                          allItems={selectedMenu.items}
                          onUpdate={updateItem}
                          onRemove={removeItem}
                          onMove={moveItem}
                          isChild
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary" onClick={addItem}>+ Eintrag hinzufügen</button>
            </div>
          ) : (
            <div className="card">
              <p className="text-muted">Wählen Sie ein Menü aus oder erstellen Sie ein neues.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface MenuItemEditorProps {
  item: MenuItem;
  index: number;
  total: number;
  allItems: MenuItem[];
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  isChild?: boolean;
}

function MenuItemEditor({ item, index, total, allItems, onUpdate, onRemove, onMove, isChild }: MenuItemEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const topLevelItems = allItems.filter((i) => !i.parentId && i.id !== item.id);

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
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{expanded ? "▼" : "▶"}</span>
        <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500 }}>
          {item.label || "(ohne Label)"}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.type}</span>
      </div>

      {expanded && (
        <div style={{ padding: "0 0.75rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="form-group">
              <label className="label">Label</label>
              <input className="input" value={item.label} onChange={(e) => onUpdate(item.id, { label: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">URL</label>
              <input className="input" value={item.url} onChange={(e) => onUpdate(item.id, { url: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <div className="form-group">
              <label className="label">Typ</label>
              <select className="select" value={item.type} onChange={(e) => onUpdate(item.id, { type: e.target.value as MenuItem["type"] })}>
                <option value="custom">Benutzerdefiniert</option>
                <option value="page">Seite</option>
                <option value="post">Beitrag</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Ziel</label>
              <select className="select" value={item.target} onChange={(e) => onUpdate(item.id, { target: e.target.value as "_self" | "_blank" })}>
                <option value="_self">Gleiches Fenster</option>
                <option value="_blank">Neues Fenster</option>
              </select>
            </div>
            {!isChild && (
              <div className="form-group">
                <label className="label">Übergeordnet</label>
                <select className="select" value={item.parentId ?? ""} onChange={(e) => onUpdate(item.id, { parentId: e.target.value || null })}>
                  <option value="">— Kein —</option>
                  {topLevelItems.map((p) => (
                    <option key={p.id} value={p.id}>{p.label || p.id}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="label">CSS-Klasse</label>
            <input className="input" value={item.cssClass} onChange={(e) => onUpdate(item.id, { cssClass: e.target.value })} placeholder="Optional" />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onMove(item.id, -1)} disabled={index === 0}>↑</button>
            <button className="btn btn-secondary btn-sm" onClick={() => onMove(item.id, 1)} disabled={index === total - 1}>↓</button>
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(item.id)}>Entfernen</button>
          </div>
        </div>
      )}
    </div>
  );
}
