"use client";

import { useState, type FormEvent } from "react";
import styles from "../../admin.module.css";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [revalLoading, setRevalLoading] = useState(false);
  const [revalMessage, setRevalMessage] = useState("");
  const [revalError, setRevalError] = useState("");

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setMessage("Passwort erfolgreich geändert.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setError(data.error || "Passwort ändern fehlgeschlagen.");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten.");
    }
  }

  async function handleRevalidate() {
    setRevalLoading(true);
    setRevalMessage("");
    setRevalError("");

    try {
      const res = await fetch("/api/v1/revalidate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRevalMessage(
          `Alle Seiten wurden erfolgreich neu generiert (${new Date(data.timestamp).toLocaleString("de-DE")}).`
        );
      } else {
        const data = await res.json();
        setRevalError(data.error || "Revalidierung fehlgeschlagen.");
      }
    } catch {
      setRevalError("Ein Fehler ist aufgetreten.");
    } finally {
      setRevalLoading(false);
    }
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Einstellungen</h1>
      </div>

      <div className="card" style={{ maxWidth: "600px", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Cache &amp; Revalidierung</h2>
        <p className="text-muted" style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
          Nach einem neuen Deployment kann es vorkommen, dass statische Seiten veraltete Daten anzeigen.
          Klicken Sie auf den Button, um alle Seiten neu zu generieren und den Cache zu leeren.
        </p>
        {revalMessage && <div className="alert alert-success">{revalMessage}</div>}
        {revalError && <div className="alert alert-error">{revalError}</div>}
        <button
          className="btn btn-primary"
          onClick={handleRevalidate}
          disabled={revalLoading}
        >
          {revalLoading ? "Wird neu generiert\u2026" : "Alle Seiten neu generieren"}
        </button>
      </div>

      <div className="card" style={{ maxWidth: "600px", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Passwort ändern</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="label">Aktuelles Passwort</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Neues Passwort</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label className="label">Neues Passwort bestätigen</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Passwort ändern
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Konfigurationsdateien</h2>
        <p className="text-muted" style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
          Die folgenden Konfigurationsdateien steuern Ihr CMS. Sie können sie direkt im Dateisystem oder über die API bearbeiten:
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.8 }}>
          <li><code>src/config/theme.json</code> — Theme und Aussehen</li>
          <li><code>src/config/consent.json</code> — Cookie-Consent-Konfiguration</li>
          <li><code>src/config/site.json</code> — Website-Name, Navigation, Footer</li>
        </ul>
      </div>
    </>
  );
}
