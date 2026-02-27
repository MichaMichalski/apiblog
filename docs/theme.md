# Theme JSON Dokumentation

Das Theme-Objekt wird in der Datenbank gespeichert (Tabelle `Setting`, Schlüssel `theme`) und steuert das gesamte visuelle Erscheinungsbild der Website. Jeder Wert wird in eine CSS Custom Property umgewandelt, die in allen Stylesheets verwendet wird. Das Theme kann über die Admin-UI (`/admin/theme`) oder die REST-API (`/api/v1/theme`) gelesen und bearbeitet werden -- kein Code muss angefasst werden.

## Speicherort

Das Theme wird als JSON-Objekt in der Datenbank gespeichert:

- **Tabelle:** `Setting`
- **Schlüssel:** `theme`
- **Wert:** JSON-String des Theme-Objekts

Die Datei `src/config/theme.json` dient nur als Fallback-Default, falls kein Eintrag in der Datenbank existiert (z.B. bei einem frischen Setup vor dem Seed).

Vorgefertigte Presets befinden sich unter `public/themes/` und können über den Admin Theme-Editor (`/admin/theme`) geladen werden.

## Schema-Übersicht (Version 2.0)

```json
{
  "version": "2.0",
  "colors": { ... },
  "fonts": { ... },
  "layout": { ... },
  "components": { ... },
  "spacing": { ... },
  "elements": { ... },
  "sections": { ... },
  "backgrounds": { ... },
  "effects": { ... }
}
```

| Feld          | Typ    | Pflicht | Beschreibung                                    |
|---------------|--------|---------|------------------------------------------------|
| `version`     | string | ja      | Schema-Version für Migrations-Kompatibilität    |
| `colors`      | object | ja      | Farbpalette der Website                         |
| `fonts`       | object | ja      | Schriftarten und -gewichte                      |
| `layout`      | object | ja      | Layout-Dimensionen und -Verhalten               |
| `components`  | object | ja      | Komponentenspezifische Styles                   |
| `spacing`     | object | ja      | Abstände zwischen Sektionen und Elementen       |
| `elements`    | object | nein    | Granulare Styles für HTML-Elemente              |
| `sections`    | object | nein    | Styles für Seitenbereiche (Header, Footer, etc.)|
| `backgrounds` | object | nein    | Hintergrund-Konfigurationen                     |
| `effects`     | object | nein    | Schatten, Übergänge, Eckenradien                |

Die neuen Felder (`elements`, `sections`, `backgrounds`, `effects`) sind optional, sodass bestehende v1.0-Themes weiterhin funktionieren.

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

---

## `spacing`

Steuert Abstände zwischen Elementen.

| Schlüssel      | CSS-Variable              | Beschreibung                        | Beispielwerte        |
|----------------|---------------------------|-------------------------------------|----------------------|
| `sectionGap`   | `--spacing-section-gap`   | Abstand zwischen Sektionen/Bereichen| `"3rem"`, `"4rem"`   |
| `paragraphGap` | `--spacing-paragraph-gap` | Abstand zwischen Content-Blöcken    | `"1.5rem"`, `"1.75rem"`|
| `cardGap`      | `--spacing-card-gap`      | Abstand zwischen Karten im Grid     | `"1.5rem"`, `"2rem"` |

---

## `elements` (neu in v2.0)

Granulare Styles für individuelle HTML-Elemente. Jeder Schlüssel wird zu CSS-Variablen mit dem Prefix `--el-<element>-<eigenschaft>`. Leere Strings (`""`) werden übersprungen und nutzen den Standard-Wert.

### `body`

| Eigenschaft     | CSS-Variable                | Beschreibung           |
|-----------------|-----------------------------|------------------------|
| `fontSize`      | `--el-body-font-size`       | Basis-Schriftgröße     |
| `lineHeight`    | `--el-body-line-height`     | Basis-Zeilenhöhe       |
| `letterSpacing` | `--el-body-letter-spacing`  | Basis-Zeichenabstand   |

### `h1` bis `h6`

Jede Überschriftenebene hat dieselben Eigenschaften:

| Eigenschaft     | CSS-Variable (Beispiel h1)       | Beschreibung                |
|-----------------|----------------------------------|-----------------------------|
| `fontSize`      | `--el-h1-font-size`             | Schriftgröße                |
| `lineHeight`    | `--el-h1-line-height`           | Zeilenhöhe                  |
| `letterSpacing` | `--el-h1-letter-spacing`        | Zeichenabstand              |
| `marginBottom`  | `--el-h1-margin-bottom`         | Abstand nach unten          |
| `color`         | `--el-h1-color`                 | Farbe (leer = erbt --color-text) |
| `textTransform` | `--el-h1-text-transform`        | none/uppercase/lowercase/capitalize |

### `paragraph`

| Eigenschaft     | CSS-Variable                       | Beschreibung             |
|-----------------|------------------------------------|--------------------------|
| `fontSize`      | `--el-paragraph-font-size`        | Schriftgröße             |
| `lineHeight`    | `--el-paragraph-line-height`      | Zeilenhöhe               |
| `marginBottom`  | `--el-paragraph-margin-bottom`    | Abstand nach unten       |
| `color`         | `--el-paragraph-color`            | Textfarbe                |

### `link`

| Eigenschaft     | CSS-Variable                  | Beschreibung                |
|-----------------|-------------------------------|-----------------------------|
| `color`         | `--el-link-color`            | Linkfarbe                   |
| `hoverColor`    | `--el-link-hover-color`      | Hover-Farbe                 |
| `underline`     | `--el-link-underline`        | none/hover/always           |
| `fontWeight`    | `--el-link-font-weight`      | Schriftgewicht              |

### `blockquote`

| Eigenschaft      | CSS-Variable                           | Beschreibung              |
|------------------|----------------------------------------|---------------------------|
| `borderLeftWidth`| `--el-blockquote-border-left-width`   | Breite des linken Rahmens |
| `borderLeftColor`| `--el-blockquote-border-left-color`   | Farbe des linken Rahmens  |
| `backgroundColor`| `--el-blockquote-background-color`    | Hintergrundfarbe          |
| `padding`        | `--el-blockquote-padding`             | Innenabstand              |
| `fontStyle`      | `--el-blockquote-font-style`          | normal/italic             |
| `fontSize`       | `--el-blockquote-font-size`           | Schriftgröße              |
| `color`          | `--el-blockquote-color`               | Textfarbe                 |

### `image`

| Eigenschaft    | CSS-Variable                 | Beschreibung            |
|----------------|------------------------------|-------------------------|
| `borderRadius` | `--el-image-border-radius`  | Eckenabrundung          |
| `shadow`       | `--el-image-shadow`         | Schatten                |
| `margin`       | `--el-image-margin`         | Außenabstand            |

### `code` (Inline)

| Eigenschaft      | CSS-Variable                    | Beschreibung            |
|------------------|---------------------------------|-------------------------|
| `fontFamily`     | `--el-code-font-family`        | Schriftart              |
| `fontSize`       | `--el-code-font-size`          | Schriftgröße            |
| `backgroundColor`| `--el-code-background-color`   | Hintergrund             |
| `padding`        | `--el-code-padding`            | Innenabstand            |
| `borderRadius`   | `--el-code-border-radius`      | Eckenradius             |
| `color`          | `--el-code-color`              | Textfarbe               |

### `codeBlock` (Pre)

| Eigenschaft      | CSS-Variable                           | Beschreibung            |
|------------------|----------------------------------------|-------------------------|
| `backgroundColor`| `--el-code-block-background-color`    | Hintergrund             |
| `borderColor`    | `--el-code-block-border-color`        | Rahmenfarbe             |
| `borderRadius`   | `--el-code-block-border-radius`       | Eckenradius             |
| `padding`        | `--el-code-block-padding`             | Innenabstand            |
| `fontSize`       | `--el-code-block-font-size`           | Schriftgröße            |
| `lineHeight`     | `--el-code-block-line-height`         | Zeilenhöhe              |

### `list`

| Eigenschaft    | CSS-Variable                    | Beschreibung              |
|----------------|---------------------------------|---------------------------|
| `paddingLeft`  | `--el-list-padding-left`       | Einzug links              |
| `itemSpacing`  | `--el-list-item-spacing`       | Abstand zwischen Elementen|
| `markerColor`  | `--el-list-marker-color`       | Farbe der Aufzählungszeichen|

### `hr`

| Eigenschaft    | CSS-Variable              | Beschreibung          |
|----------------|---------------------------|-----------------------|
| `borderColor`  | `--el-hr-border-color`   | Linienfarbe           |
| `borderWidth`  | `--el-hr-border-width`   | Linienstärke          |
| `margin`       | `--el-hr-margin`         | Außenabstand          |

### `table`

| Eigenschaft      | CSS-Variable                      | Beschreibung              |
|------------------|-----------------------------------|---------------------------|
| `borderColor`    | `--el-table-border-color`        | Rahmenfarbe               |
| `headerBackground`| `--el-table-header-background`  | Kopfzeile Hintergrund     |
| `headerColor`    | `--el-table-header-color`        | Kopfzeile Textfarbe       |
| `stripedRows`    | `--el-table-striped-rows`        | Gestreifte Zeilen (true/false) |
| `fontSize`       | `--el-table-font-size`           | Schriftgröße              |

---

## `sections` (neu in v2.0)

Steuert das Aussehen der Hauptbereiche der Website. CSS-Variable-Prefix: `--section-<name>-<eigenschaft>`.

### `header`

| Eigenschaft    | CSS-Variable                         | Beschreibung            |
|----------------|--------------------------------------|-------------------------|
| `height`       | `--section-header-height`           | Höhe des Headers        |
| `background`   | `--section-header-background`       | Hintergrundfarbe        |
| `borderColor`  | `--section-header-border-color`     | Rahmenfarbe unten       |
| `shadow`       | `--section-header-shadow`           | Box-Shadow              |
| `logoFontSize` | `--section-header-logo-font-size`   | Logo-Schriftgröße       |
| `navFontSize`  | `--section-header-nav-font-size`    | Nav-Schriftgröße        |
| `navGap`       | `--section-header-nav-gap`          | Abstand zwischen Nav-Links |
| `padding`      | `--section-header-padding`          | Innenabstand            |
| `sticky`       | `--section-header-sticky`           | Fixierter Header (true/false) |

### `footer`

| Eigenschaft    | CSS-Variable                         | Beschreibung            |
|----------------|--------------------------------------|-------------------------|
| `background`   | `--section-footer-background`       | Hintergrundfarbe        |
| `textColor`    | `--section-footer-text-color`       | Textfarbe               |
| `borderColor`  | `--section-footer-border-color`     | Rahmenfarbe oben        |
| `padding`      | `--section-footer-padding`          | Innenabstand            |
| `fontSize`     | `--section-footer-font-size`        | Schriftgröße            |

### `hero`

| Eigenschaft         | CSS-Variable                                | Beschreibung              |
|---------------------|---------------------------------------------|---------------------------|
| `background`        | `--section-hero-background`                | Hintergrundfarbe          |
| `textColor`         | `--section-hero-text-color`                | Textfarbe                 |
| `padding`           | `--section-hero-padding`                   | Innenabstand              |
| `titleFontSize`     | `--section-hero-title-font-size`           | Titel-Schriftgröße        |
| `descriptionFontSize`| `--section-hero-description-font-size`    | Beschreibung-Schriftgröße |
| `textAlign`         | `--section-hero-text-align`                | Textausrichtung           |
| `backgroundImage`   | `--section-hero-background-image`          | Hintergrundbild-URL       |
| `backgroundSize`    | `--section-hero-background-size`           | Hintergrundgröße          |
| `backgroundPosition`| `--section-hero-background-position`       | Hintergrundposition       |
| `overlay`           | `--section-hero-overlay`                   | Overlay-Farbe             |

### `postCard`

| Eigenschaft       | CSS-Variable                                  | Beschreibung              |
|-------------------|-----------------------------------------------|---------------------------|
| `background`      | `--section-post-card-background`             | Hintergrundfarbe          |
| `borderColor`     | `--section-post-card-border-color`           | Rahmenfarbe               |
| `borderRadius`    | `--section-post-card-border-radius`          | Eckenradius               |
| `shadow`          | `--section-post-card-shadow`                 | Box-Shadow                |
| `hoverShadow`     | `--section-post-card-hover-shadow`           | Hover-Shadow              |
| `imageAspectRatio`| `--section-post-card-image-aspect-ratio`     | Bild-Seitenverhältnis     |
| `titleFontSize`   | `--section-post-card-title-font-size`        | Titel-Schriftgröße        |
| `excerptFontSize` | `--section-post-card-excerpt-font-size`      | Auszug-Schriftgröße       |
| `metaFontSize`    | `--section-post-card-meta-font-size`         | Meta-Schriftgröße         |
| `padding`         | `--section-post-card-padding`                | Innenabstand              |

### `content`

| Eigenschaft      | CSS-Variable                           | Beschreibung              |
|------------------|----------------------------------------|---------------------------|
| `maxWidth`       | `--section-content-max-width`         | Maximale Inhaltsbreite    |
| `padding`        | `--section-content-padding`           | Innenabstand              |
| `imageMaxWidth`  | `--section-content-image-max-width`   | Max. Bildbreite im Inhalt |
| `imageAlignment` | `--section-content-image-alignment`   | Bildausrichtung           |

---

## `backgrounds` (neu in v2.0)

Hintergrund-Konfigurationen. CSS-Variable-Prefix: `--bg-<name>-<eigenschaft>`.

### `body`

| Eigenschaft  | CSS-Variable            | Beschreibung            | Werte                          |
|--------------|-------------------------|-------------------------|--------------------------------|
| `type`       | `--bg-body-type`       | Hintergrundtyp          | solid, gradient, image         |
| `color`      | `--bg-body-color`      | Hintergrundfarbe        | CSS-Farbwert                   |
| `image`      | `--bg-body-image`      | Hintergrundbild-URL     | url(...)                       |
| `size`       | `--bg-body-size`       | Hintergrundgröße        | cover, contain, auto           |
| `position`   | `--bg-body-position`   | Position                | center, top, bottom            |
| `repeat`     | `--bg-body-repeat`     | Wiederholung            | no-repeat, repeat, repeat-x/y  |
| `attachment` | `--bg-body-attachment` | Scroll-Verhalten        | scroll, fixed, local           |

---

## `effects` (neu in v2.0)

Globale Effekt-Tokens. CSS-Variable-Prefix: `--effect-<gruppe>-<name>`.

### `shadows`

Vordefinierte Schatten-Stufen:

| Schlüssel | CSS-Variable          | Standardwert                      |
|-----------|-----------------------|-----------------------------------|
| `sm`      | `--effect-shadows-sm` | `0 1px 2px rgba(0,0,0,0.05)`    |
| `md`      | `--effect-shadows-md` | `0 4px 6px rgba(0,0,0,0.07)`    |
| `lg`      | `--effect-shadows-lg` | `0 10px 15px rgba(0,0,0,0.1)`   |
| `xl`      | `--effect-shadows-xl` | `0 20px 25px rgba(0,0,0,0.1)`   |

### `transitions`

| Schlüssel | CSS-Variable                   | Beschreibung         |
|-----------|--------------------------------|----------------------|
| `duration`| `--effect-transitions-duration`| Übergangsdauer       |
| `timing`  | `--effect-transitions-timing`  | Timing-Funktion      |

### `borderRadius`

| Schlüssel | CSS-Variable                    | Standardwert |
|-----------|---------------------------------|-------------|
| `sm`      | `--effect-border-radius-sm`    | `4px`       |
| `md`      | `--effect-border-radius-md`    | `8px`       |
| `lg`      | `--effect-border-radius-lg`    | `16px`      |
| `full`    | `--effect-border-radius-full`  | `9999px`    |

---

## Erweiterbarkeit

Die Theme-JSON ist erweiterbar. Neue Schlüssel werden automatisch zu CSS-Variablen, da die Transformation generisch arbeitet:

- `colors.meineFarbe` wird zu `--color-meine-farbe`
- `spacing.meinAbstand` wird zu `--spacing-mein-abstand`
- `components.meineKomponente.meinWert` wird zu `--meine-komponente-mein-wert`
- `elements.meinElement.meinWert` wird zu `--el-mein-element-mein-wert`
- `sections.meineSektion.meinWert` wird zu `--section-meine-sektion-mein-wert`
- `effects.meineGruppe.meinWert` wird zu `--effect-meine-gruppe-mein-wert`

Die zugehörigen CSS-Stylesheets müssen die neuen Variablen dann in ihren Regeln verwenden.

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
    "version": "2.0",
    "colors": { "primary": "#FF5722", ... },
    "fonts": { ... },
    "layout": { ... },
    "components": { ... },
    "spacing": { ... },
    "elements": { ... },
    "sections": { ... },
    "backgrounds": { ... },
    "effects": { ... }
  }'
```

Die Felder `elements`, `sections`, `backgrounds` und `effects` sind optional. Ein v1.0-Theme ohne diese Felder funktioniert weiterhin, es werden dann die CSS-Fallback-Werte verwendet.

Beim Aktualisieren werden alle öffentlichen Seiten revalidiert, sodass das neue Theme sofort sichtbar wird. Die Änderungen sind persistent in der Datenbank gespeichert und überleben Neustarts.

---

## Mitgelieferte Presets

| Datei                       | Stil                                              |
|-----------------------------|---------------------------------------------------|
| `public/themes/default.json`| Helles Blau/Grün-Design, Merriweather-Schrift     |
| `public/themes/minimal.json`| Schwarz/Weiß, Georgia-Überschriften, keine Schatten|
| `public/themes/bold.json`   | Dunkler Hintergrund, Lila/Amber-Akzente, Inter 900|

Alle Presets nutzen das v2.0-Schema mit vollständiger Konfiguration für `elements`, `sections`, `backgrounds` und `effects`.
