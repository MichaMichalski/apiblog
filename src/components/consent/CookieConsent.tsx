"use client";

import { useState, useEffect, useCallback } from "react";
import consentConfig from "@/config/consent.json";
import styles from "./consent.module.css";

interface ConsentState {
  [category: string]: boolean;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({});

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (!stored) {
      setVisible(true);
      const initial: ConsentState = {};
      for (const [key, cat] of Object.entries(consentConfig.categories)) {
        initial[key] = cat.required ?? false;
      }
      setConsent(initial);
    }
  }, []);

  const saveConsent = useCallback(
    (state: ConsentState) => {
      localStorage.setItem("cookie-consent", JSON.stringify(state));
      document.cookie = `cookie-consent=${encodeURIComponent(JSON.stringify(state))};path=/;max-age=31536000;SameSite=Lax`;
      setVisible(false);
      window.dispatchEvent(new CustomEvent("consent-updated", { detail: state }));
    },
    []
  );

  const acceptAll = useCallback(() => {
    const all: ConsentState = {};
    for (const key of Object.keys(consentConfig.categories)) {
      all[key] = true;
    }
    setConsent(all);
    saveConsent(all);
  }, [saveConsent]);

  const acceptSelected = useCallback(() => {
    saveConsent(consent);
  }, [consent, saveConsent]);

  const rejectOptional = useCallback(() => {
    const minimal: ConsentState = {};
    for (const [key, cat] of Object.entries(consentConfig.categories)) {
      minimal[key] = cat.required ?? false;
    }
    setConsent(minimal);
    saveConsent(minimal);
  }, [saveConsent]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <h3 className={styles.title}>Cookie-Einstellungen</h3>
        <p className={styles.description}>
          Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. Bitte
          wählen Sie, welche Cookies Sie akzeptieren möchten.
        </p>
        <div className={styles.categories}>
          {Object.entries(consentConfig.categories).map(([key, cat]) => (
            <label key={key} className={styles.category}>
              <input
                type="checkbox"
                checked={consent[key] ?? false}
                disabled={cat.required}
                onChange={(e) =>
                  setConsent((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              <span className={styles.categoryInfo}>
                <strong>{cat.label}</strong>
                <span className={styles.categoryDesc}>{cat.description}</span>
              </span>
            </label>
          ))}
        </div>
        <div className={styles.buttons}>
          <button className="btn btn-secondary" onClick={rejectOptional}>
            Nur Notwendige
          </button>
          <button className="btn btn-secondary" onClick={acceptSelected}>
            Auswahl speichern
          </button>
          <button className="btn btn-primary" onClick={acceptAll}>
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
