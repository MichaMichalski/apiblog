"use client";

import { useState, useEffect } from "react";
import styles from "../../../admin.module.css";

export default function CustomCSSPage() {
  const [css, setCss] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/customizer/css")
      .then((r) => r.json())
      .then((data) => setCss(data.css || ""));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/customizer/css", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ css }),
      });
      if (res.ok) setMessage("Zusätzliches CSS gespeichert!");
      else setMessage("Speichern fehlgeschlagen.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Zusätzliches CSS</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
          Hier können Sie eigenen CSS-Code hinzufügen, der auf allen öffentlichen Seiten geladen wird.
          Das CSS wird nach dem Theme-CSS eingefügt und kann alle Styles überschreiben.
        </p>
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          style={{
            width: "100%",
            minHeight: "400px",
            fontFamily: "'Fira Code', 'Consolas', monospace",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--card-border-radius)",
            background: "#1e1e1e",
            color: "#d4d4d4",
            resize: "vertical",
            tabSize: 2,
          }}
          placeholder="/* Ihr CSS hier... */&#10;&#10;.meine-klasse {&#10;  color: red;&#10;}"
          spellCheck={false}
        />
      </div>
    </>
  );
}
