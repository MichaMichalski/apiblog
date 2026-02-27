"use client";

import { useState, useEffect } from "react";
import type { ThemeConfig } from "@/lib/theme";
import styles from "../../admin.module.css";

type Tab = "colors" | "typography" | "sections" | "effects" | "layout";

const TAB_LABELS: Record<Tab, string> = {
  colors: "Farben",
  typography: "Typografie",
  sections: "Sektionen",
  effects: "Hintergründe & Effekte",
  layout: "Layout & Abstände",
};

const ELEMENT_LABELS: Record<string, string> = {
  body: "Body", h1: "H1", h2: "H2", h3: "H3", h4: "H4", h5: "H5", h6: "H6",
  paragraph: "Absatz (p)", link: "Link (a)", blockquote: "Blockquote",
  image: "Bild (img)", code: "Code (inline)", codeBlock: "Codeblock (pre)",
  list: "Liste (ul/ol)", hr: "Trennlinie (hr)", table: "Tabelle",
};

const SECTION_LABELS: Record<string, string> = {
  header: "Header", footer: "Footer", hero: "Hero-Bereich",
  postCard: "Beitragskarte", content: "Inhaltsbereich",
};

const PROP_LABELS: Record<string, string> = {
  fontSize: "Schriftgröße", lineHeight: "Zeilenhöhe", letterSpacing: "Zeichenabstand",
  marginBottom: "Abstand unten", color: "Farbe", textTransform: "Textumwandlung",
  fontWeight: "Schriftgewicht", underline: "Unterstreichung", hoverColor: "Hover-Farbe",
  borderLeftWidth: "Rahmen links (Breite)", borderLeftColor: "Rahmen links (Farbe)",
  backgroundColor: "Hintergrundfarbe", padding: "Innenabstand", fontStyle: "Schriftstil",
  borderRadius: "Eckenradius", shadow: "Schatten", margin: "Außenabstand",
  fontFamily: "Schriftfamilie", borderColor: "Rahmenfarbe",
  paddingLeft: "Einzug links", itemSpacing: "Elementabstand", markerColor: "Aufzählungsfarbe",
  borderWidth: "Rahmenbreite", headerBackground: "Kopfzeile Hintergrund",
  headerColor: "Kopfzeile Farbe", stripedRows: "Gestreifte Zeilen",
  height: "Höhe", background: "Hintergrund", logoFontSize: "Logo Schriftgröße",
  navFontSize: "Nav Schriftgröße", navGap: "Nav Abstand", sticky: "Fixiert",
  textColor: "Textfarbe", titleFontSize: "Titel Schriftgröße",
  descriptionFontSize: "Beschreibung Schriftgröße", textAlign: "Textausrichtung",
  backgroundImage: "Hintergrundbild", backgroundSize: "Hintergrundgröße",
  backgroundPosition: "Hintergrundposition", overlay: "Overlay",
  hoverShadow: "Hover-Schatten", imageAspectRatio: "Bild-Seitenverhältnis",
  excerptFontSize: "Auszug Schriftgröße", metaFontSize: "Meta Schriftgröße",
  maxWidth: "Max. Breite", imageMaxWidth: "Bild max. Breite",
  imageAlignment: "Bildausrichtung",
  type: "Typ", image: "Bild", size: "Größe", position: "Position",
  repeat: "Wiederholung", attachment: "Anheftung",
  sm: "Klein (sm)", md: "Mittel (md)", lg: "Groß (lg)", xl: "Extra Groß (xl)", full: "Voll (full)",
  duration: "Dauer", timing: "Easing",
};

function getLabel(key: string): string {
  return PROP_LABELS[key] || key;
}

function isColorProp(prop: string): boolean {
  const lc = prop.toLowerCase();
  return lc.includes("color") || lc === "background" || lc === "overlay"
    || lc === "hovercolor" || lc === "borderleftcolor" || lc === "backgroundcolor"
    || lc === "headerbackground" || lc === "headercolor" || lc === "markercolor"
    || lc === "textcolor";
}

function isSelectProp(prop: string): string[] | null {
  if (prop === "textTransform") return ["none", "uppercase", "lowercase", "capitalize"];
  if (prop === "fontStyle") return ["normal", "italic", "oblique"];
  if (prop === "underline") return ["none", "hover", "always"];
  if (prop === "textAlign") return ["left", "center", "right"];
  if (prop === "sticky") return ["true", "false"];
  if (prop === "stripedRows") return ["true", "false"];
  if (prop === "type") return ["solid", "gradient", "image"];
  if (prop === "repeat") return ["no-repeat", "repeat", "repeat-x", "repeat-y"];
  if (prop === "attachment") return ["scroll", "fixed", "local"];
  if (prop === "imageAlignment") return ["left", "center", "right"];
  if (prop === "backgroundSize") return ["cover", "contain", "auto"];
  if (prop === "backgroundPosition") return ["center", "top", "bottom", "left", "right"];
  if (prop === "timing") return ["ease", "linear", "ease-in", "ease-out", "ease-in-out"];
  return null;
}

interface FieldProps {
  prop: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({ prop, value, onChange }: FieldProps) {
  const selectOptions = isSelectProp(prop);
  if (selectOptions) {
    return (
      <div className="form-group">
        <label className="label">{getLabel(prop)}</label>
        <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
          {value === "" && <option value="">— Standard —</option>}
          {selectOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }

  if (isColorProp(prop)) {
    return (
      <div className="form-group">
        <label className="label">{getLabel(prop)}</label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 40, height: 32, border: "1px solid var(--color-border)", borderRadius: 4, padding: 2, cursor: "pointer" }}
          />
          <input
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="z.B. #3B82F6"
            style={{ flex: 1, fontSize: "0.8125rem" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="label">{getLabel(prop)}</label>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Standard"
      />
    </div>
  );
}

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("colors");

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

  function updateComponent(comp: string, prop: string, value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        components: {
          ...prev.components,
          [comp]: { ...prev.components[comp], [prop]: value },
        },
      };
    });
  }

  function updateElement(el: string, prop: string, value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      const elements = { ...(prev.elements || {}) };
      elements[el] = { ...(elements[el] || {}), [prop]: value };
      return { ...prev, elements };
    });
  }

  function updateSection(sec: string, prop: string, value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      const sections = { ...(prev.sections || {}) };
      sections[sec] = { ...(sections[sec] || {}), [prop]: value };
      return { ...prev, sections };
    });
  }

  function updateBackground(bg: string, prop: string, value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      const backgrounds = { ...(prev.backgrounds || {}) };
      backgrounds[bg] = { ...(backgrounds[bg] || {}), [prop]: value };
      return { ...prev, backgrounds };
    });
  }

  function updateEffect(group: string, prop: string, value: string) {
    setTheme((prev) => {
      if (!prev) return prev;
      const effects = { ...(prev.effects || {}) };
      effects[group] = { ...(effects[group] || {}), [prop]: value };
      return { ...prev, effects };
    });
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

      <div className={styles.tabs}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "colors" && (
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Farbpalette</h2>
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
      )}

      {activeTab === "typography" && (
        <>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Schriftarten</h2>
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

          {theme.elements && Object.entries(theme.elements).map(([elName, elProps]) => (
            <div className="card" key={elName} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                {ELEMENT_LABELS[elName] || elName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.entries(elProps).map(([prop, value]) => (
                  <Field
                    key={prop}
                    prop={prop}
                    value={value}
                    onChange={(v) => updateElement(elName, prop, v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "sections" && (
        <>
          {theme.sections && Object.entries(theme.sections).map(([secName, secProps]) => (
            <div className="card" key={secName} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                {SECTION_LABELS[secName] || secName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.entries(secProps).map(([prop, value]) => (
                  <Field
                    key={prop}
                    prop={prop}
                    value={value}
                    onChange={(v) => updateSection(secName, prop, v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "effects" && (
        <>
          {theme.backgrounds && Object.entries(theme.backgrounds).map(([bgName, bgProps]) => (
            <div className="card" key={bgName} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                Hintergrund: {bgName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.entries(bgProps).map(([prop, value]) => (
                  <Field
                    key={prop}
                    prop={prop}
                    value={value}
                    onChange={(v) => updateBackground(bgName, prop, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          {theme.effects && Object.entries(theme.effects).map(([groupName, groupProps]) => (
            <div className="card" key={groupName} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                {groupName === "shadows" ? "Schatten" : groupName === "transitions" ? "Übergänge" : groupName === "borderRadius" ? "Eckenradien" : groupName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.entries(groupProps).map(([prop, value]) => (
                  <Field
                    key={prop}
                    prop={prop}
                    value={value}
                    onChange={(v) => updateEffect(groupName, prop, v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "layout" && (
        <>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Layout</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {Object.entries(theme.layout).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label className="label">{getLabel(key) !== key ? getLabel(key) : key}</label>
                  <input
                    className="input"
                    value={value}
                    onChange={(e) => updateLayout(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Abstände</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {Object.entries(theme.spacing).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label className="label">{getLabel(key) !== key ? getLabel(key) : key}</label>
                  <input
                    className="input"
                    value={value}
                    onChange={(e) => updateSpacing(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Komponenten</h2>
            {Object.entries(theme.components).map(([comp, props]) => (
              <div key={comp} style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem", textTransform: "capitalize" }}>{comp}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {Object.entries(props).map(([prop, value]) => (
                    <div key={prop} className="form-group">
                      <label className="label">{getLabel(prop)}</label>
                      <input
                        className="input"
                        value={value}
                        onChange={(e) => updateComponent(comp, prop, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
