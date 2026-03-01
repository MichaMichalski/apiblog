# Content-Block Dokumentation (Beiträge & Seiten)

Beiträge (Posts) und Seiten (Pages) verwenden ein blockbasiertes Content-System. Der Inhalt wird als JSON-Array von Blöcken gespeichert und kann sowohl über die Admin-UI als auch über die REST-API erstellt und bearbeitet werden.

---

## Post-Schema

Felder für einen Blogbeitrag bei der Erstellung über `POST /api/v1/posts`:

```json
{
  "title": "Mein Beitrag",
  "slug": "mein-beitrag",
  "content": [ ... ],
  "excerpt": "Kurze Zusammenfassung",
  "status": "published",
  "featuredImage": "/uploads/hero.jpg",
  "seoTitle": "SEO-Titel",
  "seoDescription": "SEO-Beschreibung",
  "focusKeyword": "mein keyword",
  "noIndex": false,
  "canonicalUrl": "https://example.com/mein-beitrag",
  "publishedAt": "2026-02-24T12:00:00Z"
}
```

| Feld             | Typ      | Pflicht | Default   | Beschreibung                                          |
|------------------|----------|---------|-----------|-------------------------------------------------------|
| `title`          | string   | ja      | --        | Titel des Beitrags                                    |
| `slug`           | string   | ja      | --        | URL-Slug (nur `a-z`, `0-9`, `-`). Muss einzigartig sein. |
| `content`        | Block[]  | nein    | `[]`      | Array von Content-Blöcken (siehe unten)               |
| `excerpt`        | string   | nein    | `""`      | Kurzer Auszug für Übersichtsseiten und SEO            |
| `status`         | string   | nein    | `"draft"` | `"draft"` oder `"published"`                          |
| `featuredImage`  | string?  | nein    | `null`    | Pfad zum Beitragsbild (z.B. `/uploads/bild.jpg`)      |
| `seoTitle`       | string?  | nein    | `null`    | Titel für `<title>`-Tag und OG/Twitter (fällt auf `title` zurück) |
| `seoDescription` | string?  | nein    | `null`    | Meta-Description für Suchmaschinen und Social Media   |
| `focusKeyword`   | string?  | nein    | `null`    | Fokus-Keyword für die SEO-Analyse (siehe [SEO-Dokumentation](seo.md)) |
| `noIndex`        | boolean  | nein    | `false`   | Wenn `true`, wird `<meta name="robots" content="noindex, follow">` gesetzt und die Seite aus der Sitemap ausgeschlossen |
| `canonicalUrl`   | string?  | nein    | `null`    | Überschreibt die automatisch generierte Canonical URL |
| `publishedAt`    | string?  | nein    | jetzt     | ISO-8601 Datum. Wird automatisch auf jetzt gesetzt bei `status: "published"` |

### Slug-Regeln

Der Slug muss dem Muster `^[a-z0-9]+(?:-[a-z0-9]+)*$` entsprechen:
- Nur Kleinbuchstaben, Zahlen und Bindestriche
- Darf nicht mit einem Bindestrich beginnen oder enden
- Beispiele: `mein-beitrag`, `hello-world`, `post123`

### Automatisch generierte SEO-Tags (pro Post)

Beim Rendern eines veröffentlichten Posts werden folgende Tags automatisch erzeugt:

- `<title>` — aus `seoTitle` oder `title`
- `<meta name="description">` — aus `seoDescription` oder `excerpt`
- `<link rel="canonical">` — aus `canonicalUrl` oder automatisch (`/blog/{slug}`)
- `<meta name="robots">` — `noindex, follow` wenn `noIndex: true`
- **Open Graph**: `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type=article`, `og:image` (aus `featuredImage`), `article:published_time`, `article:modified_time`, `article:author`
- **Twitter Cards**: `twitter:card` (summary_large_image bei Bild, sonst summary), `twitter:title`, `twitter:description`, `twitter:image`
- **JSON-LD**: `Article`-Schema mit `headline`, `description`, `author`, `datePublished`, `dateModified`, `publisher`, `image`
- **Lesezeit**: Automatisch berechnet und angezeigt (basierend auf 200 Wörter/Minute)

---

## Page-Schema

Felder für eine Seite bei der Erstellung über `POST /api/v1/pages`:

```json
{
  "title": "Über uns",
  "slug": "ueber-uns",
  "content": [ ... ],
  "status": "published",
  "seoTitle": "Über uns",
  "seoDescription": "Erfahren Sie mehr über unser Unternehmen",
  "focusKeyword": "über uns unternehmen",
  "noIndex": false,
  "canonicalUrl": null,
  "sortOrder": 1
}
```

| Feld             | Typ      | Pflicht | Default   | Beschreibung                                          |
|------------------|----------|---------|-----------|-------------------------------------------------------|
| `title`          | string   | ja      | --        | Titel der Seite                                       |
| `slug`           | string   | ja      | --        | URL-Slug (gleiche Regeln wie bei Posts)                |
| `content`        | Block[]  | nein    | `[]`      | Array von Content-Blöcken                             |
| `status`         | string   | nein    | `"draft"` | `"draft"` oder `"published"`                          |
| `seoTitle`       | string?  | nein    | `null`    | Titel für `<title>`-Tag und OG/Twitter                |
| `seoDescription` | string?  | nein    | `null`    | Meta-Description für Suchmaschinen und Social Media   |
| `focusKeyword`   | string?  | nein    | `null`    | Fokus-Keyword für die SEO-Analyse                     |
| `noIndex`        | boolean  | nein    | `false`   | Wenn `true`, Seite von Suchmaschinen ausschließen     |
| `canonicalUrl`   | string?  | nein    | `null`    | Überschreibt die automatisch generierte Canonical URL |
| `sortOrder`      | number   | nein    | `0`       | Sortierung in der Navigation (aufsteigend)            |

Reservierte Slugs (`blog`, `admin`, `api`) sind für Seiten nicht erlaubt.

### Automatisch generierte SEO-Tags (pro Page)

- `<title>` — aus `seoTitle` oder `title`
- `<meta name="description">` — aus `seoDescription`
- `<link rel="canonical">` — aus `canonicalUrl` oder automatisch (`/{slug}`)
- `<meta name="robots">` — `noindex, follow` wenn `noIndex: true`
- **Open Graph**: `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type=website`
- **Twitter Cards**: `twitter:card=summary`, `twitter:title`, `twitter:description`
- **JSON-LD**: `WebPage`-Schema mit `name`, `description`, `url`, `isPartOf` (WebSite)

---

## Content-Blöcke

Das `content`-Feld ist ein JSON-Array von Block-Objekten. Jeder Block hat ein `type`-Feld, das seinen Typ bestimmt, sowie typspezifische Daten. Blöcke werden in der Reihenfolge des Arrays gerendert.

### Block-Typ-Übersicht

| Typ         | Beschreibung                          | Cookie-Consent benötigt |
|-------------|---------------------------------------|-------------------------|
| `paragraph` | Textabsatz (unterstützt HTML)         | nein                    |
| `heading`   | Überschrift (H1-H6)                   | nein                    |
| `image`     | Bild mit optionaler Bildunterschrift  | nein                    |
| `quote`     | Zitat mit optionalem Autor            | nein                    |
| `code`      | Code-Block mit Syntaxhervorhebung     | nein                    |
| `list`      | Nummerierte oder Aufzählungsliste     | nein                    |
| `divider`   | Horizontale Trennlinie                | nein                    |
| `ad`        | Werbeanzeige (z.B. Google AdSense)    | ja (advertising)        |

---

### `paragraph`

Ein Textabsatz. Unterstützt einfaches HTML (z.B. `<a>`, `<strong>`, `<em>`) im `content`-Feld.

```json
{
  "type": "paragraph",
  "content": "Dies ist ein Absatz mit <strong>fett</strong> und <a href=\"/blog\">einem Link</a>."
}
```

| Feld      | Typ    | Pflicht | Beschreibung                     |
|-----------|--------|---------|----------------------------------|
| `type`    | string | ja      | Muss `"paragraph"` sein          |
| `content` | string | ja      | Text-Inhalt (darf HTML enthalten)|

---

### `heading`

Eine Überschrift. Das Level bestimmt die HTML-Tag-Stufe (`<h1>` bis `<h6>`).

```json
{
  "type": "heading",
  "level": 2,
  "content": "Kapitel-Überschrift"
}
```

| Feld      | Typ    | Pflicht | Beschreibung                        |
|-----------|--------|---------|-------------------------------------|
| `type`    | string | ja      | Muss `"heading"` sein               |
| `level`   | number | ja      | Überschrifts-Level: `1` bis `6`     |
| `content` | string | ja      | Text der Überschrift                |

---

### `image`

Ein Bild mit optionaler Bildunterschrift und flexibler Positionierung.

```json
{
  "type": "image",
  "src": "/uploads/foto.jpg",
  "alt": "Beschreibung des Bildes",
  "caption": "Foto: Sonnenuntergang am Meer",
  "position": "full"
}
```

| Feld       | Typ    | Pflicht | Default  | Beschreibung                                     |
|------------|--------|---------|----------|--------------------------------------------------|
| `type`     | string | ja      | --       | Muss `"image"` sein                              |
| `src`      | string | ja      | --       | Pfad oder URL des Bildes                         |
| `alt`      | string | nein    | `""`     | Alt-Text für Barrierefreiheit und SEO            |
| `caption`  | string | nein    | --       | Bildunterschrift (wird unter dem Bild angezeigt) |
| `position` | string | nein    | `"full"` | Positionierung des Bildes (siehe unten)          |

**Positionierungs-Optionen (`position`):**

| Wert     | Verhalten                                                                 |
|----------|---------------------------------------------------------------------------|
| `full`   | Volle Breite des Content-Bereichs                                        |
| `left`   | 50% Breite, linksbündig, Text fließt rechts daneben (Float). Auf Mobilgeräten (< 768px): volle Breite, kein Float |
| `right`  | 50% Breite, rechtsbündig, Text fließt links daneben (Float). Auf Mobilgeräten (< 768px): volle Breite, kein Float |
| `inline` | Natürliche Größe des Bildes, Inline-Darstellung                         |

Bilder mit `left` oder `right` eignen sich dafür, den Textfluss nicht zu unterbrechen -- der nächste `paragraph`-Block fließt neben dem Bild:

```json
[
  { "type": "image", "src": "/uploads/portrait.jpg", "alt": "Portrait", "position": "left" },
  { "type": "paragraph", "content": "Dieser Text fließt neben dem Bild. Er umschließt das Bild und füllt den restlichen Platz aus..." },
  { "type": "paragraph", "content": "Noch ein Absatz, der neben dem Bild weitergeht." }
]
```

---

### `quote`

Ein Zitat-Block mit optionalem Autor.

```json
{
  "type": "quote",
  "content": "Die einzige Konstante im Leben ist die Veränderung.",
  "author": "Heraklit"
}
```

| Feld      | Typ    | Pflicht | Beschreibung                               |
|-----------|--------|---------|--------------------------------------------|
| `type`    | string | ja      | Muss `"quote"` sein                        |
| `content` | string | ja      | Text des Zitats                            |
| `author`  | string | nein    | Autor des Zitats (wird als "-- Autor" angezeigt)|

---

### `code`

Ein Code-Block mit Angabe der Programmiersprache.

```json
{
  "type": "code",
  "language": "javascript",
  "content": "function greet(name) {\n  return `Hallo ${name}!`;\n}"
}
```

| Feld       | Typ    | Pflicht | Default  | Beschreibung                                |
|------------|--------|---------|----------|---------------------------------------------|
| `type`     | string | ja      | --       | Muss `"code"` sein                          |
| `language` | string | nein    | `"text"` | Programmiersprache (z.B. `javascript`, `python`, `json`)|
| `content`  | string | ja      | --       | Code-Inhalt (Zeilenumbrüche mit `\n`)       |

Die Sprache wird als Label über dem Code-Block angezeigt (außer bei `"text"`).

---

### `list`

Eine geordnete oder ungeordnete Liste.

```json
{
  "type": "list",
  "style": "unordered",
  "items": [
    "Erster Punkt",
    "Zweiter Punkt",
    "Dritter Punkt mit <strong>Formatierung</strong>"
  ]
}
```

| Feld    | Typ      | Pflicht | Default       | Beschreibung                            |
|---------|----------|---------|---------------|-----------------------------------------|
| `type`  | string   | ja      | --            | Muss `"list"` sein                      |
| `style` | string   | nein    | `"unordered"` | `"ordered"` (nummeriert) oder `"unordered"` (Aufzählung)|
| `items` | string[] | ja      | --            | Array von Listenpunkten (dürfen HTML enthalten)|

---

### `divider`

Eine horizontale Trennlinie. Hat keine weiteren Felder.

```json
{
  "type": "divider"
}
```

| Feld   | Typ    | Pflicht | Beschreibung            |
|--------|--------|---------|-------------------------|
| `type` | string | ja      | Muss `"divider"` sein   |

---

### `ad`

Ein Werbeanzeigen-Block (z.B. Google AdSense). Wird **nur angezeigt, wenn der Benutzer dem Cookie-Consent für die Kategorie "advertising" zugestimmt hat**. Ohne Zustimmung wird der Block unsichtbar übersprungen, sodass der Textfluss nicht gestört wird.

```json
{
  "type": "ad",
  "provider": "adsense",
  "slot": "1234567890",
  "format": "in-article"
}
```

| Feld       | Typ    | Pflicht | Default        | Beschreibung                            |
|------------|--------|---------|----------------|-----------------------------------------|
| `type`     | string | ja      | --             | Muss `"ad"` sein                        |
| `provider` | string | ja      | --             | Werbeanbieter (aktuell: `"adsense"`)    |
| `slot`     | string | nein    | --             | Ad-Slot-ID des Anbieters                |
| `format`   | string | nein    | `"in-article"` | Anzeigeformat (siehe unten)             |

**Format-Optionen:**

| Wert          | Beschreibung                                          |
|---------------|-------------------------------------------------------|
| `in-article`  | Fluid-Format, das sich in den Textfluss einfügt       |
| `display`     | Standard-Display-Anzeige (responsive)                 |
| `in-feed`     | Anzeige im Feed/Listing-Stil                          |

**Werbung im Textfluss platzieren:**

Setzen Sie `ad`-Blöcke zwischen `paragraph`-Blöcke, um Werbung natürlich in den Lesefluss einzubetten:

```json
[
  { "type": "paragraph", "content": "Erster Textabschnitt..." },
  { "type": "paragraph", "content": "Zweiter Textabschnitt..." },
  { "type": "ad", "provider": "adsense", "slot": "1234567890", "format": "in-article" },
  { "type": "paragraph", "content": "Der Text geht nach der Anzeige weiter..." }
]
```

---

## Vollständiges Beispiel: Blogbeitrag via API (mit SEO)

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "Reise nach Berlin",
    "slug": "reise-nach-berlin",
    "status": "published",
    "excerpt": "Ein Wochenende in der Hauptstadt mit den besten Tipps für Sehenswürdigkeiten und Gastronomie.",
    "featuredImage": "/uploads/berlin-header.jpg",
    "seoTitle": "Reise nach Berlin - Tipps für ein perfektes Wochenende",
    "seoDescription": "Die besten Tipps für ein Wochenende in Berlin: Sehenswürdigkeiten, Gastronomie und Geheimtipps.",
    "focusKeyword": "reise berlin",
    "noIndex": false,
    "canonicalUrl": null,
    "content": [
      {
        "type": "paragraph",
        "content": "Eine Reise nach Berlin ist immer eine gute Idee. Letztes Wochenende habe ich einige der besten Sehenswürdigkeiten besucht und möchte meine Erfahrungen teilen."
      },
      {
        "type": "image",
        "src": "/uploads/brandenburger-tor.jpg",
        "alt": "Brandenburger Tor bei Nacht",
        "caption": "Das Brandenburger Tor ist besonders abends beeindruckend.",
        "position": "full"
      },
      {
        "type": "heading",
        "level": 2,
        "content": "Meine Top 3 Tipps für eine Reise nach Berlin"
      },
      {
        "type": "list",
        "style": "ordered",
        "items": [
          "Besuchen Sie die Museumsinsel am Vormittag",
          "Machen Sie eine Bootstour auf der Spree",
          "Probieren Sie Currywurst bei Konnopke"
        ]
      },
      {
        "type": "ad",
        "provider": "adsense",
        "slot": "9876543210",
        "format": "in-article"
      },
      {
        "type": "heading",
        "level": 2,
        "content": "Fazit"
      },
      {
        "type": "quote",
        "content": "Berlin ist immer eine Reise wert.",
        "author": "Jeder, der dort war"
      },
      {
        "type": "paragraph",
        "content": "Ich kann jedem nur empfehlen, mindestens ein Wochenende in Berlin zu verbringen. Die Stadt bietet für jeden Geschmack etwas."
      },
      {
        "type": "divider"
      },
      {
        "type": "paragraph",
        "content": "<em>Haben Sie Fragen? Schreiben Sie mir gerne!</em>"
      }
    ]
  }'
```

Dieser Beitrag erzeugt automatisch:
- Open Graph Tags mit `og:image` aus dem `featuredImage`
- JSON-LD `Article`-Schema
- Canonical URL: `https://example.com/blog/reise-nach-berlin`
- SEO-Analyse-Score im Admin-Editor basierend auf dem Fokus-Keyword "reise berlin"

## Vollständiges Beispiel: Seite via API (mit SEO)

```bash
curl -X POST http://localhost:3000/api/v1/pages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "Impressum",
    "slug": "impressum",
    "status": "published",
    "sortOrder": 10,
    "seoTitle": "Impressum - Mein Blog",
    "seoDescription": "Rechtliche Angaben und Kontaktinformationen gemäß § 5 TMG.",
    "focusKeyword": "impressum",
    "noIndex": false,
    "content": [
      {
        "type": "heading",
        "level": 2,
        "content": "Angaben gemäß § 5 TMG"
      },
      {
        "type": "paragraph",
        "content": "Max Mustermann<br>Musterstraße 1<br>12345 Musterstadt"
      },
      {
        "type": "heading",
        "level": 2,
        "content": "Kontakt"
      },
      {
        "type": "paragraph",
        "content": "E-Mail: kontakt@example.com"
      }
    ]
  }'
```

## Seite von Suchmaschinen ausschließen

Um eine Seite oder einen Beitrag von Suchmaschinen auszuschließen:

```bash
curl -X PUT http://localhost:3000/api/v1/pages/PAGE_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "noIndex": true }'
```

Dies bewirkt:
- `<meta name="robots" content="noindex, follow">` wird im HTML gesetzt
- Die Seite wird aus der `/sitemap.xml` entfernt
- Der Beitrag bleibt über die URL erreichbar, wird aber nicht mehr indexiert

---

## Unbekannte Block-Typen

Wenn ein Block-Typ im `content`-Array nicht erkannt wird (z.B. durch eine ältere Version des CMS), wird er als einfacher Absatz gerendert, der den Text `[Unknown block: <type>]` anzeigt. Bestehende Inhalte gehen nie verloren -- das System ist vorwärtskompatibel.

## Validierung

Alle Block-Strukturen werden bei der Erstellung über die API serverseitig mit Zod validiert. Ungültige Blöcke führen zu einem `400 Bad Request` mit Details zum Validierungsfehler. Dieselbe Validierung findet auch in der Admin-UI statt.
