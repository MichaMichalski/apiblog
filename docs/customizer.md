# Customizer Dokumentation

Der Customizer fasst alle Anpassungsoptionen zusammen, die über das reine Theme hinausgehen: Header-/Footer-Builder, Homepage-Einstellungen, Blog-Layout, Lese-Einstellungen und zusätzliches CSS. Alle Konfigurationen werden als JSON in der `Setting`-Tabelle gespeichert.

## Übersicht

| Bereich | Setting-Key | Admin-Seite | API-Endpunkt |
|---------|-------------|-------------|-------------|
| Header-Builder | `header_builder` | `/admin/customizer/header` | `/api/v1/customizer/header` |
| Footer-Builder | `footer_builder` | `/admin/customizer/footer` | `/api/v1/customizer/footer` |
| Homepage | `homepage_settings` | `/admin/customizer/homepage` | `/api/v1/customizer/homepage` |
| Blog-Layout | `blog_layout` | `/admin/customizer/blog-layout` | `/api/v1/customizer/blog-layout` |
| Lese-Einstellungen | `reading_settings` | `/admin/customizer/reading` | `/api/v1/customizer/reading` |
| Zusätzliches CSS | `custom_css` | `/admin/customizer/css` | `/api/v1/customizer/css` |

---

## Header-Builder

Definiert die Struktur des Website-Headers mit bis zu drei Zeilen (Top-Bar, Hauptleiste, Bottom-Bar). Jede Zeile hat drei Spalten (links, mitte, rechts) in die Elemente platziert werden.

### Datenmodell

```json
{
  "rows": [
    {
      "id": "top-bar",
      "enabled": false,
      "background": "",
      "textColor": "",
      "columns": [
        { "id": "left", "elements": [] },
        { "id": "center", "elements": [] },
        { "id": "right", "elements": [] }
      ]
    },
    {
      "id": "main",
      "enabled": true,
      "background": "",
      "textColor": "",
      "columns": [
        { "id": "left", "elements": ["logo"] },
        { "id": "center", "elements": [] },
        { "id": "right", "elements": ["primary-menu"] }
      ]
    },
    {
      "id": "bottom-bar",
      "enabled": false,
      "background": "",
      "textColor": "",
      "columns": [
        { "id": "left", "elements": [] },
        { "id": "center", "elements": [] },
        { "id": "right", "elements": [] }
      ]
    }
  ],
  "elementSettings": {
    "button": { "text": "Kontakt", "url": "/kontakt" },
    "custom-text": { "text": "" },
    "custom-html": { "html": "" }
  }
}
```

### Verfügbare Header-Elemente

| Element-ID | Beschreibung |
|-----------|-------------|
| `logo` | Website-Logo oder -Name |
| `primary-menu` | Hauptnavigations-Menü (aus Menü-System, Position "header") |
| `secondary-menu` | Sekundäres Menü (aus Menü-System, Position "footer") |
| `search-toggle` | Suchfeld |
| `social-icons` | Social-Media-Links (aus Site-Config) |
| `button` | CTA-Button mit konfigurierbarem Text und URL |
| `custom-text` | Frei definierbarer Text |
| `custom-html` | Frei definierbarer HTML-Code |

### Zeilen

| Zeile | Standard | Beschreibung |
|-------|----------|-------------|
| `top-bar` | Deaktiviert | Schmale Leiste über dem Header |
| `main` | Aktiviert | Hauptleiste mit Logo und Navigation |
| `bottom-bar` | Deaktiviert | Leiste unter dem Header |

### Farbvererbung in Rows

Wenn eine Row `textColor` gesetzt hat, wird diese Farbe an alle Kindelemente vererbt. Nav-Links, Social-Icons und das Logo nutzen `color: inherit` und passen sich automatisch an. Dadurch funktioniert z.B. eine dunkle Top-Bar mit heller Schrift korrekt, ohne dass Links ihre eigene Farbe erzwingen.

### Responsives Verhalten

Auf Bildschirmen unter 768px:
- **Top-Bar und Bottom-Bar** werden ausgeblendet
- **Center-Spalte** wird ausgeblendet
- **Desktop-Navigation** (`primary-menu`, `secondary-menu`) wird ausgeblendet
- **Hamburger-Menu** erscheint automatisch (Slide-in von rechts mit allen Nav-Items inkl. Untermenüs)
- **Suchfeld und Social-Icons** werden im Header ausgeblendet (verfügbar über Widgets/Mobile-Menu)

---

## Footer-Builder

Definiert die Struktur des Website-Footers mit einem Widget-Bereich und einer Bottom-Bar.

### Datenmodell

```json
{
  "rows": [
    {
      "id": "widgets",
      "enabled": false,
      "background": "",
      "textColor": "",
      "layout": "3-columns",
      "widgetAreas": ["footer-1", "footer-2", "footer-3"]
    },
    {
      "id": "bottom-bar",
      "enabled": true,
      "background": "",
      "textColor": "",
      "columns": [
        { "id": "left", "elements": ["copyright"] },
        { "id": "center", "elements": [] },
        { "id": "right", "elements": ["footer-menu"] }
      ]
    }
  ],
  "elementSettings": {
    "copyright": { "text": "" }
  }
}
```

### Widget-Row Layouts

| Layout | Beschreibung |
|--------|-------------|
| `1-column` | Eine Spalte |
| `2-columns` | Zwei gleichbreite Spalten |
| `3-columns` | Drei gleichbreite Spalten |
| `4-columns` | Vier gleichbreite Spalten |

### Verfügbare Footer-Elemente (Bottom-Bar)

| Element-ID | Beschreibung |
|-----------|-------------|
| `copyright` | Copyright-Text (fallback: Footer-Text aus Site-Config) |
| `footer-menu` | Footer-Menü (aus Menü-System, Position "footer") |
| `social-icons` | Social-Media-Links |
| `custom-text` | Frei definierbarer Text |
| `custom-html` | Frei definierbarer HTML-Code |

### Farbvererbung im Footer

Wie beim Header-Builder erben Footer-Widgets und Links die `textColor` der jeweiligen Row. Widget-Titel, -Inhalte und Social-Links passen sich automatisch an die Row-Farbe an.

### Responsives Verhalten

Auf Bildschirmen unter 768px:
- **Widget-Grid** wird auf eine Spalte gestapelt (unabhängig vom konfigurierten Layout)
- **Bottom-Bar** wird vertikal zentriert gestapelt
- Alle Spalten (left/center/right) werden zentriert

---

## Homepage-Einstellungen

Steuert, was auf der Startseite angezeigt wird.

### Datenmodell

```json
{
  "type": "posts",
  "staticPageId": null,
  "blogPageId": null
}
```

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `type` | "posts" \| "page" | `posts` = letzte Beiträge, `page` = statische Seite |
| `staticPageId` | string \| null | Seiten-ID für die statische Startseite |
| `blogPageId` | string \| null | Seiten-ID für die Beitragsseite (reserviert) |

---

## Blog-Layout

Steuert die Darstellung der Blog-Übersichtsseite.

### Datenmodell

```json
{
  "layout": "grid",
  "columns": 3,
  "showFeaturedImage": true,
  "showExcerpt": true,
  "showAuthor": true,
  "showDate": true,
  "showReadMore": true,
  "excerptLength": 150,
  "readMoreText": "Weiterlesen",
  "pagination": "numbered",
  "postsPerPage": 10,
  "sidebarEnabled": false,
  "sidebarPosition": "right"
}
```

| Feld | Typ | Standard | Beschreibung |
|------|-----|----------|-------------|
| `layout` | "grid" \| "list" \| "masonry" | "grid" | Layout-Typ |
| `columns` | number | 3 | Spaltenanzahl (Grid/Masonry) |
| `showFeaturedImage` | boolean | true | Beitragsbilder anzeigen |
| `showExcerpt` | boolean | true | Auszüge anzeigen |
| `showAuthor` | boolean | true | Autor anzeigen |
| `showDate` | boolean | true | Datum anzeigen |
| `showReadMore` | boolean | true | "Weiterlesen"-Link anzeigen |
| `excerptLength` | number | 150 | Maximale Zeichenlänge des Auszugs |
| `readMoreText` | string | "Weiterlesen" | Text des Weiterlesen-Links |
| `pagination` | "numbered" \| "load-more" \| "infinite" | "numbered" | Paginierungstyp |
| `postsPerPage` | number | 10 | Beiträge pro Seite |
| `sidebarEnabled` | boolean | false | Sidebar anzeigen |
| `sidebarPosition` | "left" \| "right" | "right" | Sidebar-Position |

**Responsives Verhalten:** Auf Bildschirmen unter 768px wird die Sidebar unter den Hauptinhalt gestapelt (volle Breite), unabhängig von `sidebarPosition`.

---

## Lese-Einstellungen

Allgemeine Einstellungen für die Inhaltsanzeige und Feeds.

### Datenmodell

```json
{
  "showFullContent": false,
  "excerptLength": 55,
  "feedPostsCount": 10,
  "feedContentType": "excerpt",
  "searchEngineVisibility": false
}
```

| Feld | Typ | Standard | Beschreibung |
|------|-----|----------|-------------|
| `showFullContent` | boolean | false | Volltext statt Auszug in Listen |
| `excerptLength` | number | 55 | Auszug-Länge (Wörter) |
| `feedPostsCount` | number | 10 | Beiträge im RSS-Feed |
| `feedContentType` | "excerpt" \| "full" | "excerpt" | Feed-Inhaltstyp |
| `searchEngineVisibility` | boolean | false | true = noindex auf allen Seiten |

---

## Zusätzliches CSS

Ermöglicht das Hinzufügen von benutzerdefiniertem CSS-Code, der nach dem Theme-CSS geladen wird.

### Datenmodell

```json
{
  "css": "/* Benutzerdefiniertes CSS */\n.meine-klasse { color: red; }"
}
```

Das CSS wird als `<style>`-Tag im `<head>` eingefügt, nach den Theme-CSS-Variablen, und kann alle bestehenden Styles überschreiben.

---

## REST API (alle Endpunkte)

Alle Endpunkte folgen dem Muster `GET` (öffentlich) / `PUT` (authentifiziert).

| Methode | Endpunkt | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/v1/customizer/header` | Nein | Header-Builder Config abrufen |
| PUT | `/api/v1/customizer/header` | Ja | Header-Builder Config speichern |
| GET | `/api/v1/customizer/footer` | Nein | Footer-Builder Config abrufen |
| PUT | `/api/v1/customizer/footer` | Ja | Footer-Builder Config speichern |
| GET | `/api/v1/customizer/homepage` | Nein | Homepage-Einstellungen abrufen |
| PUT | `/api/v1/customizer/homepage` | Ja | Homepage-Einstellungen speichern |
| GET | `/api/v1/customizer/blog-layout` | Nein | Blog-Layout Config abrufen |
| PUT | `/api/v1/customizer/blog-layout` | Ja | Blog-Layout Config speichern |
| GET | `/api/v1/customizer/reading` | Nein | Lese-Einstellungen abrufen |
| PUT | `/api/v1/customizer/reading` | Ja | Lese-Einstellungen speichern |
| GET | `/api/v1/customizer/css` | Nein | Custom CSS abrufen |
| PUT | `/api/v1/customizer/css` | Ja | Custom CSS speichern |

Authentifizierung erfolgt über Session-Cookie oder `x-api-key` Header.

---

## Beispiele

### Header mit Top-Bar und Suche konfigurieren

```bash
curl -X PUT http://localhost:3000/api/v1/customizer/header \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "rows": [
      {
        "id": "top-bar",
        "enabled": true,
        "background": "#1F2937",
        "textColor": "#F9FAFB",
        "columns": [
          { "id": "left", "elements": ["custom-text"] },
          { "id": "center", "elements": [] },
          { "id": "right", "elements": ["social-icons"] }
        ]
      },
      {
        "id": "main",
        "enabled": true,
        "background": "",
        "textColor": "",
        "columns": [
          { "id": "left", "elements": ["logo"] },
          { "id": "center", "elements": [] },
          { "id": "right", "elements": ["primary-menu", "search-toggle"] }
        ]
      },
      {
        "id": "bottom-bar",
        "enabled": false,
        "background": "",
        "textColor": "",
        "columns": [
          { "id": "left", "elements": [] },
          { "id": "center", "elements": [] },
          { "id": "right", "elements": [] }
        ]
      }
    ],
    "elementSettings": {
      "custom-text": { "text": "Willkommen auf meinem Blog!" }
    }
  }'
```

### Statische Startseite setzen

```bash
curl -X PUT http://localhost:3000/api/v1/customizer/homepage \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "type": "page", "staticPageId": "clxyz...", "blogPageId": null }'
```

### Blog-Layout anpassen

```bash
curl -X PUT http://localhost:3000/api/v1/customizer/blog-layout \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "layout": "list",
    "columns": 1,
    "showFeaturedImage": true,
    "showExcerpt": true,
    "showAuthor": true,
    "showDate": true,
    "showReadMore": true,
    "excerptLength": 200,
    "readMoreText": "Mehr lesen →",
    "pagination": "numbered",
    "postsPerPage": 5,
    "sidebarEnabled": true,
    "sidebarPosition": "right"
  }'
```

### Custom CSS hinzufügen

```bash
curl -X PUT http://localhost:3000/api/v1/customizer/css \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "css": ".heroSection { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }" }'
```
