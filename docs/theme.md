# Theme JSON Dokumentation

Das Theme-Objekt wird in der Datenbank gespeichert (Tabelle `Setting`, Schlüssel `theme`) und steuert das gesamte visuelle Erscheinungsbild der Website. Jeder Wert wird in eine CSS Custom Property umgewandelt, die in allen Stylesheets verwendet wird. Das Theme kann über die Admin-UI (`/admin/theme`) oder die REST-API (`/api/v1/theme`) gelesen und bearbeitet werden -- kein Code muss angefasst werden.

## Speicherort

Das Theme wird als JSON-Objekt in der Datenbank gespeichert:

- **Tabelle:** `Setting`
- **Schlüssel:** `theme`
- **Wert:** JSON-String des Theme-Objekts

Die Datei `src/config/theme.json` dient nur als Fallback-Default, falls kein Eintrag in der Datenbank existiert (z.B. bei einem frischen Setup vor dem Seed).

Vorgefertigte Presets befinden sich unter `public/themes/` und können über den Admin Theme-Editor (`/admin/theme`) geladen werden.

## Schema-Übersicht

```json
{
  "version": "1.0",
  "colors": { ... },
  "fonts": { ... },
  "layout": { ... },
  "components": { ... },
  "spacing": { ... }
}
```

| Feld         | Typ    | Pflicht | Beschreibung                                    |
|--------------|--------|---------|------------------------------------------------|
| `version`    | string | ja      | Schema-Version für Migrations-Kompatibilität    |
| `colors`     | object | ja      | Farbpalette der Website                         |
| `fonts`      | object | ja      | Schriftarten und -gewichte                      |
| `layout`     | object | ja      | Layout-Dimensionen und -Verhalten               |
| `components` | object | ja      | Komponentenspezifische Styles                   |
| `spacing`    | object | ja      | Abstände zwischen Sektionen und Elementen       |

---

## `colors`

Jeder Schlüssel wird zu einer CSS-Variable `--color-<name>` (camelCase wird zu kebab-case).

| Schlüssel        | CSS-Variable              | Verwendung                                      |
|------------------|---------------------------|-------------------------------------------------|
| `primary`        | `--color-primary`         | Primärfarbe: Links, Buttons, Akzente            |
| `primaryHover`   | `--color-primary-hover`   | Hover-Zustand der Primärfarbe                   |
| `secondary`      | `--color-secondary`       | Sekundärfarbe: Badges, Sekundär-Buttons         |
| `secondaryHover` | `--color-secondary-hover` | Hover-Zustand der Sekundärfarbe                 |
| `background`     | `--color-background`      | Hintergrund des `<body>` und Hauptflächen       |
| `surface`        | `--color-surface`         | Hintergrund von Karten, Tabellen, Eingabefeldern|
| `surfaceHover`   | `--color-surface-hover`   | Hover-Zustand von Flächen                       |
| `text`           | `--color-text`            | Standard-Textfarbe                              |
| `textMuted`      | `--color-text-muted`      | Gedämpfter Text: Metadaten, Beschreibungen      |
| `border`         | `--color-border`          | Rahmen, Trennlinien, Tabellenränder             |
| `error`          | `--color-error`           | Fehlermeldungen, Löschen-Buttons                |
| `success`        | `--color-success`         | Erfolgsmeldungen, "Veröffentlicht"-Badges       |
| `warning`        | `--color-warning`         | Warnungen                                       |

Alle Werte sind gültige CSS-Farbwerte (Hex, RGB, HSL).

**Beispiel: Dark Mode durch Farb-Änderung:**

```json
{
  "background": "#0F172A",
  "surface": "#1E293B",
  "text": "#F1F5F9",
  "textMuted": "#94A3B8",
  "border": "#334155"
}
```

---

## `fonts`

Definiert die Schriftarten für Überschriften und Fließtext. Jeder Eintrag besteht aus `family` und `weight`.

| Schlüssel | CSS-Variablen                               | Beschreibung           |
|-----------|---------------------------------------------|------------------------|
| `heading` | `--font-heading`, `--font-heading-weight`   | Alle `<h1>` bis `<h6>` |
| `body`    | `--font-body`, `--font-body-weight`         | Fließtext, Absätze     |

**Struktur:**

```json
{
  "heading": { "family": "Inter, system-ui, sans-serif", "weight": "700" },
  "body": { "family": "Merriweather, Georgia, serif", "weight": "400" }
}
```

- `family`: CSS `font-family`-Wert mit Fallback-Schriften (kommasepariert)
- `weight`: CSS `font-weight` (z.B. `"400"`, `"700"`, `"900"`)

Google Fonts werden automatisch importiert, wenn die erste Schrift im `family`-String ein Google-Font-Name ist (keine System-Fonts wie `system-ui`, `serif`, `sans-serif`).

**Beispiel: Monospace-Look:**

```json
{
  "heading": { "family": "Fira Code, monospace", "weight": "700" },
  "body": { "family": "JetBrains Mono, monospace", "weight": "400" }
}
```

---

## `layout`

Steuert die Dimensionen und das Verhalten des Seitenlayouts.

| Schlüssel        | CSS-Variable                  | Beschreibung                          | Beispielwerte          |
|------------------|-------------------------------|---------------------------------------|------------------------|
| `maxWidth`       | `--layout-max-width`          | Maximale Breite des Seitencontainers  | `"1200px"`, `"1400px"` |
| `contentWidth`   | `--layout-content-width`      | Maximale Breite des Textinhalts       | `"780px"`, `"680px"`   |
| `sidebarPosition`| `--layout-sidebar-position`   | Position der Sidebar (reserviert)     | `"right"`, `"left"`    |
| `headerStyle`    | `--layout-header-style`       | Header-Verhalten                      | `"fixed"`, `"static"`  |

---

## `components`

Komponentenspezifische Styles. Jeder Schlüssel ist ein Komponentenname, die Unterwerte werden zu CSS-Variablen `--<komponente>-<eigenschaft>`.

### `card`

| Eigenschaft    | CSS-Variable          | Beschreibung                     |
|----------------|-----------------------|----------------------------------|
| `borderRadius` | `--card-border-radius`| Eckenabrundung von Karten        |
| `shadow`       | `--card-shadow`       | Box-Shadow von Karten            |

### `button`

| Eigenschaft    | CSS-Variable            | Beschreibung                   |
|----------------|-------------------------|--------------------------------|
| `borderRadius` | `--button-border-radius`| Eckenabrundung von Buttons     |

### `input`

| Eigenschaft    | CSS-Variable           | Beschreibung                    |
|----------------|------------------------|---------------------------------|
| `borderRadius` | `--input-border-radius`| Eckenabrundung von Eingabefeldern|

**Beispiel: Abgerundetes Design:**

```json
{
  "card": { "borderRadius": "16px", "shadow": "0 4px 12px rgba(0,0,0,0.3)" },
  "button": { "borderRadius": "12px" },
  "input": { "borderRadius": "12px" }
}
```

**Beispiel: Kantiges Design (kein Radius, kein Schatten):**

```json
{
  "card": { "borderRadius": "0px", "shadow": "none" },
  "button": { "borderRadius": "0px" },
  "input": { "borderRadius": "0px" }
}
```

---

## `spacing`

Steuert Abstände zwischen Elementen.

| Schlüssel      | CSS-Variable              | Beschreibung                        | Beispielwerte        |
|----------------|---------------------------|-------------------------------------|----------------------|
| `sectionGap`   | `--spacing-section-gap`   | Abstand zwischen Sektionen/Bereichen| `"3rem"`, `"4rem"`   |
| `paragraphGap` | `--spacing-paragraph-gap` | Abstand zwischen Content-Blöcken    | `"1.5rem"`, `"1.75rem"`|
| `cardGap`      | `--spacing-card-gap`      | Abstand zwischen Karten im Grid     | `"1.5rem"`, `"2rem"` |

---

## Erweiterbarkeit

Die Theme-JSON ist erweiterbar. Neue Schlüssel werden automatisch zu CSS-Variablen, da die Transformation generisch arbeitet:

- `colors.meineFarbe` wird zu `--color-meine-farbe`
- `spacing.meinAbstand` wird zu `--spacing-mein-abstand`
- `components.meineKomponente.meinWert` wird zu `--meine-komponente-mein-wert`

Die zugehörigen CSS-Stylesheets (`src/styles/theme.css`, `src/styles/components.css`) müssen die neuen Variablen dann in ihren Regeln verwenden.

---

## API-Zugriff

Das Theme wird in der Datenbank gespeichert und kann über die REST-API gelesen und aktualisiert werden:

```
GET  /api/v1/theme          Aktuelles Theme aus der DB abrufen
PUT  /api/v1/theme          Theme in der DB aktualisieren (erfordert Authentifizierung)
```

**Theme per API aktualisieren:**

```bash
curl -X PUT http://localhost:3000/api/v1/theme \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "version": "1.0",
    "colors": { "primary": "#FF5722", ... },
    "fonts": { ... },
    "layout": { ... },
    "components": { ... },
    "spacing": { ... }
  }'
```

Beim Aktualisieren werden alle öffentlichen Seiten revalidiert, sodass das neue Theme sofort sichtbar wird. Die Änderungen sind persistent in der Datenbank gespeichert und überleben Neustarts.

---

## Mitgelieferte Presets

| Datei                       | Stil                                              |
|-----------------------------|---------------------------------------------------|
| `public/themes/default.json`| Helles Blau/Grün-Design, Merriweather-Schrift     |
| `public/themes/minimal.json`| Schwarz/Weiß, Georgia-Überschriften, keine Schatten|
| `public/themes/bold.json`   | Dunkler Hintergrund, Lila/Amber-Akzente, Inter 900|
