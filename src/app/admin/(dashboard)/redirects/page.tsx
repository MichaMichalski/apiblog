"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

interface Redirect {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = { source: "", destination: "", statusCode: 301, isActive: true };

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRedirects() {
    const res = await fetch("/api/v1/redirects");
    if (res.ok) {
      const data = await res.json();
      setRedirects(data.redirects);
    }
  }

  useEffect(() => {
    loadRedirects();
  }, []);

  function startEdit(r: Redirect) {
    setEditingId(r.id);
    setForm({
      source: r.source,
      destination: r.destination,
      statusCode: r.statusCode,
      isActive: r.isActive,
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editingId
        ? `/api/v1/redirects/${editingId}`
        : "/api/v1/redirects";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler beim Speichern");
        return;
      }

      setMessage(editingId ? "Weiterleitung aktualisiert!" : "Weiterleitung erstellt!");
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadRedirects();
    } catch {
      setError("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Weiterleitung wirklich löschen?")) return;
    setMessage("");
    setError("");

    const res = await fetch(`/api/v1/redirects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Weiterleitung gelöscht!");
      if (editingId === id) cancelEdit();
      await loadRedirects();
    } else {
      setError("Fehler beim Löschen");
    }
  }

  async function handleToggle(r: Redirect) {
    const res = await fetch(`/api/v1/redirects/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    if (res.ok) {
      await loadRedirects();
    }
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Weiterleitungen</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>
        <div className="card">
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Quelle</th>
                <th>Ziel</th>
                <th>Status</th>
                <th>Aktiv</th>
                <th style={{ width: "120px" }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
                    Keine Weiterleitungen vorhanden
                  </td>
                </tr>
              )}
              {redirects.map((r) => (
                <tr key={r.id} style={{ opacity: r.isActive ? 1 : 0.5 }}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{r.source}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{r.destination}</td>
                  <td>{r.statusCode}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(r)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.125rem",
                      }}
                      title={r.isActive ? "Deaktivieren" : "Aktivieren"}
                    >
                      {r.isActive ? "✓" : "✗"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>
                        Bearbeiten
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            {editingId ? "Weiterleitung bearbeiten" : "Neue Weiterleitung"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="label">Quellpfad</label>
              <input
                className="input"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                placeholder="/alter-pfad"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Zielpfad / URL</label>
              <input
                className="input"
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="/neuer-pfad oder https://..."
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Statuscode</label>
              <select
                className="select"
                value={form.statusCode}
                onChange={(e) => setForm((f) => ({ ...f, statusCode: parseInt(e.target.value) }))}
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporär</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Aktiv
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Wird gespeichert..." : editingId ? "Aktualisieren" : "Erstellen"}
              </button>
              {editingId && (
                <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                  Abbrechen
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
