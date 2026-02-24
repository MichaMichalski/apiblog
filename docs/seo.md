# SEO & Analytics Dokumentation

Dieses CMS enthält umfassende SEO-Funktionen, die mit Yoast SEO vergleichbar sind. Alle Features funktionieren automatisch für veröffentlichte Inhalte und können pro Beitrag/Seite über die Admin-UI oder die REST-API konfiguriert werden.

---

## Übersicht

| Feature | Beschreibung |
|---------|-------------|
| Sitemap.xml | Dynamisch generiert, enthält alle veröffentlichten Inhalte |
| Robots.txt | Blockiert Admin/API, verweist auf Sitemap |
| Open Graph Tags | Facebook, LinkedIn, WhatsApp-Vorschau |
| Twitter Cards | Twitter/X-Vorschau mit Bild-Support |
| JSON-LD Structured Data | Article, WebPage und WebSite Schemas |
| Canonical URLs | Automatisch oder manuell pro Seite |
| Meta Robots (noindex) | Seiten individuell von der Indexierung ausschließen |
| Fokus-Keyword-Analyse | Echtzeit-SEO-Score im Admin-Editor |
| Lesezeit-Berechnung | Automatische Lesezeit-Anzeige auf Blog-Posts |
| Cookie Consent | DSGVO-konformes Consent-Management für Analytics/Ads |
| Google Analytics | Consent-gesteuertes Tracking |
| Google AdSense | Consent-gesteuerte Werbeanzeigen |

---

## Sitemap.xml

Verfügbar unter `/sitemap.xml`. Wird dynamisch aus der Datenbank generiert und enthält:

- Die Homepage (`/`) mit `priority: 1.0` und `changefreq: daily`
- Die Blog-Übersicht (`/blog`) mit `priority: 0.9` und `changefreq: daily`
- Alle veröffentlichten Seiten (`/{slug}`) mit `priority: 0.8` und `changefreq: monthly`
- Alle veröffentlichten Blog-Posts (`/blog/{slug}`) mit `priority: 0.7` und `changefreq: weekly`

Seiten mit `noIndex: true` werden automatisch aus der Sitemap ausgeschlossen.

Die Sitemap enthält für jeden Eintrag das `<lastmod>`-Datum (letztes Update des Inhalts).

**Beispiel-Ausgabe:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <lastmod>2026-02-24T20:16:18.929Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://example.com/blog/reise-nach-berlin</loc>
    <lastmod>2026-02-24T18:20:45.819Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Konfiguration

Die Basis-URL wird aus der Umgebungsvariable `NEXT_PUBLIC_SITE_URL` gelesen. Stellen Sie sicher, dass diese in Produktion korrekt gesetzt ist (z.B. `https://www.meinblog.de`).

---

## Robots.txt

Verfügbar unter `/robots.txt`. Enthält:

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

Der Admin-Bereich und die API werden von der Indexierung ausgeschlossen.

---

## Open Graph Tags

Automatisch auf allen öffentlichen Seiten generiert. Ermöglicht ansprechende Vorschauen beim Teilen auf Facebook, LinkedIn, WhatsApp etc.

### Blog-Posts

```html
<meta property="og:title" content="Reise nach Berlin">
<meta property="og:description" content="Die besten Tipps...">
<meta property="og:url" content="https://example.com/blog/reise-nach-berlin">
<meta property="og:site_name" content="My Blog">
<meta property="og:type" content="article">
<meta property="og:image" content="https://example.com/uploads/berlin-header.jpg">
<meta property="article:published_time" content="2026-02-24T12:00:00Z">
<meta property="article:modified_time" content="2026-02-24T14:30:00Z">
<meta property="article:author" content="Admin">
```

Das `og:image` wird aus dem `featuredImage`-Feld des Posts generiert. Ohne Beitragsbild wird kein Bild-Tag gesetzt.

### Statische Seiten

```html
<meta property="og:title" content="Über uns">
<meta property="og:description" content="Erfahren Sie mehr...">
<meta property="og:url" content="https://example.com/ueber-uns">
<meta property="og:site_name" content="My Blog">
<meta property="og:type" content="website">
```

---

## Twitter Cards

Automatisch auf allen öffentlichen Seiten:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Reise nach Berlin">
<meta name="twitter:description" content="Die besten Tipps...">
<meta name="twitter:image" content="https://example.com/uploads/berlin-header.jpg">
```

Der Kartentyp ist `summary_large_image` wenn ein `featuredImage` vorhanden ist, ansonsten `summary`.

---

## JSON-LD Structured Data

Structured Data wird als `<script type="application/ld+json">` in den HTML-Code eingebettet. Google nutzt diese Daten für Rich Snippets in den Suchergebnissen.

### Homepage: WebSite-Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "My Blog",
  "description": "A modern statically generated blog",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/blog?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### Blog-Posts: Article-Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Reise nach Berlin",
  "description": "Die besten Tipps für ein Wochenende in Berlin.",
  "url": "https://example.com/blog/reise-nach-berlin",
  "image": "https://example.com/uploads/berlin-header.jpg",
  "datePublished": "2026-02-24T12:00:00Z",
  "dateModified": "2026-02-24T14:30:00Z",
  "author": { "@type": "Person", "name": "Admin" },
  "publisher": { "@type": "Organization", "name": "My Blog" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.com/blog/reise-nach-berlin" }
}
```

### Statische Seiten: WebPage-Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Über uns",
  "description": "Erfahren Sie mehr über unser Unternehmen",
  "url": "https://example.com/ueber-uns",
  "isPartOf": {
    "@type": "WebSite",
    "name": "My Blog",
    "url": "https://example.com"
  }
}
```

---

## Canonical URLs

Jede Seite hat automatisch einen `<link rel="canonical">` Tag:

- Blog-Posts: `https://example.com/blog/{slug}`
- Statische Seiten: `https://example.com/{slug}`

Diese automatisch generierten URLs können pro Post/Page überschrieben werden, indem das Feld `canonicalUrl` gesetzt wird. Dies ist nützlich für:

- Syndizierte Inhalte (Originale Quelle als Canonical)
- Umzug von einer anderen Domain
- Zusammenführung doppelter Inhalte

**Via API überschreiben:**

```bash
curl -X PUT http://localhost:3000/api/v1/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "canonicalUrl": "https://original-source.com/article" }'
```

---

## Meta Robots (noindex)

Einzelne Seiten oder Beiträge können von der Indexierung ausgeschlossen werden:

```bash
curl -X PUT http://localhost:3000/api/v1/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "noIndex": true }'
```

Auswirkungen:
- `<meta name="robots" content="noindex, follow">` wird im HTML gesetzt
- Die Seite wird aus `/sitemap.xml` entfernt
- Die Seite bleibt über die URL erreichbar (kein 404)
- Suchmaschinen werden angewiesen, die Seite nicht zu indexieren, aber Links auf ihr zu folgen

In der Admin-UI gibt es eine Checkbox "Seite von Suchmaschinen ausschließen (noindex)" in den SEO-Einstellungen.

---

## Fokus-Keyword & SEO-Analyse

### Fokus-Keyword

Jeder Beitrag und jede Seite kann ein Fokus-Keyword haben. Dieses Keyword wird für die Echtzeit-SEO-Analyse im Admin-Editor verwendet.

**Via API setzen:**

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "Reise nach Berlin",
    "slug": "reise-nach-berlin",
    "focusKeyword": "reise berlin",
    "content": [...]
  }'
```

### SEO-Analyse-Panel

Im Admin-Editor (sowohl für Posts als auch Pages) gibt es ein SEO-Analyse-Panel in der Sidebar, das in Echtzeit folgende Checks durchführt:

| Check | Gut | Warnung | Fehler |
|-------|-----|---------|--------|
| **SEO-Titel** | 30-60 Zeichen | Zu kurz/lang | Fehlt |
| **Meta-Beschreibung** | 120-160 Zeichen | Zu kurz/lang | Fehlt |
| **Keyword im Titel** | Vorhanden | -- | Fehlt |
| **Keyword in Beschreibung** | Vorhanden | Fehlt | -- |
| **Keyword im Slug** | Vorhanden | Fehlt | -- |
| **Keyword-Dichte** | 0.5-2.5% | Zu niedrig/hoch | Nicht vorhanden |
| **Keyword in Einleitung** | Im 1. Absatz | Nicht im 1. Absatz | -- |
| **Textlänge** | 300+ Wörter | 100-300 Wörter | Unter 100 |
| **Zwischenüberschriften** | Vorhanden | Fehlen | -- |
| **Bilder** | Mit Alt-Text | Ohne Alt-Text | Keine Bilder |
| **Links** | Vorhanden | Fehlen | -- |

Der Score wird als Prozent angezeigt mit farbiger Bewertung:
- **Grün (70-100%)**: Gut
- **Gelb (40-69%)**: Verbesserungswürdig
- **Rot (0-39%)**: Mangelhaft

Jede Zeichenlängen-Angabe wird unter den Eingabefeldern live angezeigt (z.B. "45/60 Zeichen").

---

## Lesezeit

Für Blog-Posts wird automatisch eine geschätzte Lesezeit berechnet und angezeigt. Die Berechnung basiert auf 200 Wörtern pro Minute und berücksichtigt alle Textblöcke (Absätze, Überschriften, Zitate, Listen).

---

## Google Analytics

Google Analytics wird über den Cookie-Consent-Mechanismus gesteuert.

### Konfiguration

In `src/config/consent.json`:

```json
{
  "categories": {
    "analytics": {
      "label": "Analyse",
      "description": "Cookies zur Analyse der Website-Nutzung.",
      "required": false,
      "scripts": [
        {
          "provider": "google-analytics",
          "trackingId": "G-XXXXXXXXXX"
        }
      ]
    }
  }
}
```

Ersetzen Sie `G-XXXXXXXXXX` durch Ihre Google Analytics Measurement ID.

### Funktionsweise

1. Der Cookie-Consent-Banner wird beim ersten Besuch angezeigt
2. Der Benutzer kann die Kategorie "Analyse" akzeptieren oder ablehnen
3. Nur bei Zustimmung wird das Google Analytics Script geladen
4. Die Präferenz wird in `localStorage` und als Cookie gespeichert
5. Bei Änderung der Präferenz wird das Script dynamisch nachgeladen

---

## Google AdSense

Google AdSense wird ebenfalls über den Cookie-Consent gesteuert.

### Konfiguration

In `src/config/consent.json`:

```json
{
  "categories": {
    "advertising": {
      "label": "Werbung",
      "description": "Cookies für personalisierte Werbung.",
      "required": false,
      "scripts": [
        {
          "provider": "google-adsense",
          "publisherId": "ca-pub-XXXXXXXXXX"
        }
      ]
    }
  }
}
```

### Ad-Blöcke in Inhalten

Werbeanzeigen werden als `ad`-Blöcke im Content platziert (siehe [Content-Block Dokumentation](content-blocks.md#ad)). Sie werden nur gerendert, wenn der Benutzer der "Werbung"-Kategorie im Cookie-Consent zugestimmt hat.

---

## API-Referenz: SEO-Felder

### Posts

```
POST   /api/v1/posts         — Neuen Post erstellen (mit SEO-Feldern)
PUT    /api/v1/posts/:id     — Post aktualisieren (SEO-Felder einzeln updatebar)
GET    /api/v1/posts/:id     — Post abrufen (enthält alle SEO-Felder)
GET    /api/v1/posts         — Posts listen (alle SEO-Felder in Response)
```

SEO-Felder im Request-Body:

```json
{
  "seoTitle": "Optimierter Titel für Suchmaschinen",
  "seoDescription": "Optimierte Beschreibung, 120-160 Zeichen empfohlen.",
  "focusKeyword": "hauptkeyword",
  "noIndex": false,
  "canonicalUrl": "https://example.com/original-article"
}
```

Alle Felder sind optional und können einzeln per `PUT` aktualisiert werden.

### Pages

```
POST   /api/v1/pages         — Neue Seite erstellen (mit SEO-Feldern)
PUT    /api/v1/pages/:id     — Seite aktualisieren (SEO-Felder einzeln updatebar)
GET    /api/v1/pages/:id     — Seite abrufen (enthält alle SEO-Felder)
GET    /api/v1/pages         — Seiten listen (alle SEO-Felder in Response)
```

Gleiche SEO-Felder wie bei Posts.

### Beispiel: SEO-Felder per API aktualisieren

```bash
# Fokus-Keyword und Meta-Beschreibung nachträglich setzen
curl -X PUT http://localhost:3000/api/v1/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "focusKeyword": "berlin reisetipps",
    "seoDescription": "Die besten Reisetipps für Berlin: Sehenswürdigkeiten, Restaurants und Geheimtipps für Ihr Wochenende."
  }'
```

```bash
# Seite von Suchmaschinen ausschließen
curl -X PUT http://localhost:3000/api/v1/pages/PAGE_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "noIndex": true }'
```

```bash
# Custom Canonical URL setzen
curl -X PUT http://localhost:3000/api/v1/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "canonicalUrl": "https://original-source.com/article" }'
```

---

## Technische Details

### Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/app/sitemap.ts` | Dynamische Sitemap-Generierung |
| `src/app/robots.ts` | Robots.txt-Generierung |
| `src/lib/seo.ts` | SEO-Hilfsfunktionen, Textanalyse, `analyzeSeo()` |
| `src/components/seo/JsonLd.tsx` | JSON-LD Structured Data Komponenten |
| `src/components/admin/SeoAnalysis.tsx` | SEO-Analyse-Panel für den Admin-Editor |
| `src/components/consent/CookieConsent.tsx` | Cookie-Consent-Banner |
| `src/components/consent/ScriptLoader.tsx` | Consent-gesteuerter Script-Loader |
| `src/config/consent.json` | Analytics/AdSense-Konfiguration |

### Datenbank-Felder

Die folgenden SEO-Felder sind in den Modellen `Post` und `Page` verfügbar:

| Feld | Typ | Default | Beschreibung |
|------|-----|---------|-------------|
| `seoTitle` | String? | null | Überschreibt den Titel für Suchmaschinen |
| `seoDescription` | String? | null | Meta-Beschreibung |
| `focusKeyword` | String? | null | Fokus-Keyword für SEO-Analyse |
| `noIndex` | Boolean | false | Seite von Indexierung ausschließen |
| `canonicalUrl` | String? | null | Überschreibt die automatische Canonical URL |
