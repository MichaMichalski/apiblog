# Widget-System Dokumentation

Das Widget-System ermöglicht das Platzieren von konfigurierbaren Inhaltsblöcken in definierten Bereichen der Website, analog zu WordPress-Widgets und Sidebars. Widgets und Widget-Bereiche werden als JSON in der `Setting`-Tabelle gespeichert.

## Speicherort

| Setting-Key    | Beschreibung                          |
|---------------|---------------------------------------|
| `widget_areas` | Array der definierten Widget-Bereiche |
| `widgets`      | Array aller Widget-Instanzen          |

## Datenmodell

### WidgetArea

```json
{
  "id": "sidebar",
  "name": "Sidebar",
  "description": "Rechte Seitenleiste"
}
```

### Standard-Bereiche

| ID | Name | Verwendung |
|----|------|-----------|
| `sidebar` | Sidebar | Seitenleiste neben Blog-Inhalt |
| `footer-1` | Footer Spalte 1 | Erste Spalte im Footer-Widget-Bereich |
| `footer-2` | Footer Spalte 2 | Zweite Spalte |
| `footer-3` | Footer Spalte 3 | Dritte Spalte |
| `before-content` | Vor dem Inhalt | Vor dem Hauptinhalt |
| `after-content` | Nach dem Inhalt | Nach dem Hauptinhalt |

### Widget

```json
{
  "id": "w_abc123",
  "type": "recent-posts",
  "areaId": "sidebar",
  "sortOrder": 0,
  "settings": {
    "title": "Neueste Beiträge",
    "count": 5,
    "showDate": true,
    "showImage": false
  }
}
```

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | string | Eindeutige Widget-ID |
| `type` | WidgetType | Widget-Typ (siehe unten) |
| `areaId` | string | ID des Widget-Bereichs |
| `sortOrder` | number | Reihenfolge im Bereich |
| `settings` | object | Typ-spezifische Einstellungen |

## Widget-Typen

### text

Freier Text/HTML-Inhalt.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `title` | string | "" | Überschrift |
| `content` | string | "" | HTML-Inhalt |

### recent-posts

Zeigt die neuesten veröffentlichten Beiträge.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `title` | string | "Neueste Beiträge" | Überschrift |
| `count` | number | 5 | Anzahl der Beiträge |
| `showDate` | boolean | true | Datum anzeigen |
| `showImage` | boolean | false | Beitragsbild anzeigen |

### search

Suchfeld für die Website.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `title` | string | "Suche" | Überschrift |
| `placeholder` | string | "Suchen..." | Platzhaltertext |

### custom-html

Beliebiger HTML-Code.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `content` | string | "" | HTML-Code |

### social-links

Social-Media-Link-Buttons.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `title` | string | "Folge uns" | Überschrift |
| `links` | array | [] | Array von `{ platform, url }` |

Unterstützte Plattformen: Twitter/X, GitHub, LinkedIn, Facebook, Instagram, YouTube, Mastodon, TikTok.

### newsletter

Newsletter-Anmeldeformular.

| Setting | Typ | Standard | Beschreibung |
|---------|-----|----------|-------------|
| `title` | string | "Newsletter" | Überschrift |
| `description` | string | "" | Beschreibungstext |
| `action` | string | "" | Formular-Action-URL |

### categories (Vorbereitung)

Kategorienliste. Wird angezeigt, wenn Kategorien implementiert werden.

### tag-cloud (Vorbereitung)

Tag-Wolke. Wird angezeigt, wenn Tags implementiert werden.

## REST API

### Widget-Bereiche

| Methode | Endpunkt | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/v1/widget-areas` | Nein | Alle Bereiche abrufen |
| PUT | `/api/v1/widget-areas` | Ja | Bereiche aktualisieren (Array) |

### Widgets

| Methode | Endpunkt | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/v1/widgets` | Nein | Alle Widgets abrufen |
| POST | `/api/v1/widgets` | Ja | Neues Widget erstellen |
| GET | `/api/v1/widgets/:id` | Nein | Einzelnes Widget abrufen |
| PUT | `/api/v1/widgets/:id` | Ja | Widget aktualisieren |
| DELETE | `/api/v1/widgets/:id` | Ja | Widget löschen |

## Beispiele

### Widget erstellen

```bash
curl -X POST http://localhost:3000/api/v1/widgets \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "type": "recent-posts",
    "areaId": "sidebar",
    "settings": {
      "title": "Neueste Beiträge",
      "count": 5,
      "showDate": true,
      "showImage": true
    }
  }'
```

### Widget verschieben

```bash
curl -X PUT http://localhost:3000/api/v1/widgets/w_abc123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "areaId": "footer-1", "sortOrder": 0 }'
```

### Neuen Widget-Bereich hinzufügen

```bash
curl -X PUT http://localhost:3000/api/v1/widget-areas \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '[
    { "id": "sidebar", "name": "Sidebar", "description": "Rechte Seitenleiste" },
    { "id": "footer-1", "name": "Footer Spalte 1", "description": "" },
    { "id": "footer-2", "name": "Footer Spalte 2", "description": "" },
    { "id": "footer-3", "name": "Footer Spalte 3", "description": "" },
    { "id": "before-content", "name": "Vor dem Inhalt", "description": "" },
    { "id": "after-content", "name": "Nach dem Inhalt", "description": "" },
    { "id": "custom-area", "name": "Mein Bereich", "description": "Benutzerdefiniert" }
  ]'
```

## Admin-UI

Widgets werden unter `/admin/widgets` verwaltet:

- Alle Widget-Bereiche werden als Karten angezeigt
- Widgets per Dropdown hinzufügen
- Widgets aufklappen zum Bearbeiten der Einstellungen
- Widgets sortieren (hoch/runter) und zwischen Bereichen verschieben
- Typ-spezifische Einstellungsformulare

## Frontend-Rendering

Die `WidgetArea`-Komponente rendert alle Widgets eines Bereichs:

```tsx
import WidgetArea from "@/components/widgets/WidgetArea";

<WidgetArea areaId="sidebar" />
```

Der Footer-Builder kann Widget-Bereiche in seinem Widget-Row referenzieren. Die Blog-Seite zeigt die Sidebar, wenn `sidebarEnabled` im Blog-Layout aktiviert ist.
