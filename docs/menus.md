# Menü-System Dokumentation

Das Menü-System ermöglicht die Verwaltung von hierarchischen Navigationsmenüs mit mehreren Positionen (Locations), analog zu WordPress. Menüs werden als JSON in der `Setting`-Tabelle gespeichert.

## Speicherort

| Setting-Key      | Beschreibung                         |
|------------------|--------------------------------------|
| `menus`          | Array aller Menü-Definitionen        |
| `menu_locations` | Zuordnung: Position → Menü-ID        |

## Datenmodell

### Menu

```json
{
  "id": "primary",
  "name": "Hauptnavigation",
  "items": [
    {
      "id": "mi_abc123",
      "label": "Home",
      "url": "/",
      "type": "custom",
      "parentId": null,
      "sortOrder": 0,
      "target": "_self",
      "cssClass": ""
    }
  ]
}
```

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | string | Eindeutige Menü-ID |
| `name` | string | Anzeigename des Menüs |
| `items` | MenuItem[] | Liste der Menüeinträge |

### MenuItem

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | string | Eindeutige Eintrag-ID |
| `label` | string | Angezeigter Text |
| `url` | string | Ziel-URL |
| `type` | "custom" \| "page" \| "post" | Eintragstyp |
| `parentId` | string \| null | ID des übergeordneten Eintrags (für Untermenüs) |
| `sortOrder` | number | Reihenfolge innerhalb der Ebene |
| `target` | "_self" \| "_blank" | Link-Ziel |
| `cssClass` | string | Optionale CSS-Klasse |

### MenuLocations

```json
{
  "header": "primary",
  "footer": "footer",
  "mobile": "primary"
}
```

| Position | Beschreibung |
|----------|-------------|
| `header` | Hauptnavigation im Header |
| `footer` | Navigation im Footer |
| `mobile` | Mobile Navigation |

Jeder Wert ist entweder eine Menü-ID oder `null`.

## REST API

### Menüs

| Methode | Endpunkt | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/v1/menus` | Nein | Alle Menüs abrufen |
| POST | `/api/v1/menus` | Ja | Neues Menü erstellen |
| GET | `/api/v1/menus/:id` | Nein | Einzelnes Menü abrufen |
| PUT | `/api/v1/menus/:id` | Ja | Menü aktualisieren |
| DELETE | `/api/v1/menus/:id` | Ja | Menü löschen |

### Menü-Positionen

| Methode | Endpunkt | Auth | Beschreibung |
|---------|----------|------|-------------|
| GET | `/api/v1/menu-locations` | Nein | Alle Positionen abrufen |
| PUT | `/api/v1/menu-locations` | Ja | Positionen aktualisieren |

## Beispiele

### Neues Menü erstellen

```bash
curl -X POST http://localhost:3000/api/v1/menus \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "id": "footer",
    "name": "Footer-Navigation",
    "items": [
      { "id": "f1", "label": "Impressum", "url": "/impressum", "type": "custom", "parentId": null, "sortOrder": 0, "target": "_self", "cssClass": "" },
      { "id": "f2", "label": "Datenschutz", "url": "/datenschutz", "type": "custom", "parentId": null, "sortOrder": 1, "target": "_self", "cssClass": "" }
    ]
  }'
```

### Menü dem Footer zuweisen

```bash
curl -X PUT http://localhost:3000/api/v1/menu-locations \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{ "header": "primary", "footer": "footer", "mobile": "primary" }'
```

### Hierarchisches Menü (Untermenüs)

Setzen Sie `parentId` auf die ID eines übergeordneten Eintrags:

```json
{
  "id": "primary",
  "name": "Hauptnavigation",
  "items": [
    { "id": "m1", "label": "Blog", "url": "/blog", "type": "custom", "parentId": null, "sortOrder": 0, "target": "_self", "cssClass": "" },
    { "id": "m2", "label": "Tutorials", "url": "/blog/tutorials", "type": "custom", "parentId": "m1", "sortOrder": 0, "target": "_self", "cssClass": "" },
    { "id": "m3", "label": "Guides", "url": "/blog/guides", "type": "custom", "parentId": "m1", "sortOrder": 1, "target": "_self", "cssClass": "" }
  ]
}
```

Im Frontend wird daraus ein Dropdown-Menü unter "Blog" mit den Einträgen "Tutorials" und "Guides".

## Admin-UI

Menüs werden unter `/admin/menus` verwaltet:

- **Linke Spalte:** Liste aller Menüs, Menü-Positionen zuweisen
- **Rechte Spalte:** Menüeinträge bearbeiten, hinzufügen, sortieren, verschachteln
- Neue Menüs erstellen und benennen
- Einträge mit Label, URL, Typ, Ziel und CSS-Klasse konfigurieren

## Fallback

Wenn kein Menü für die Position "header" definiert ist, wird das bestehende `navigation`-Array aus der Site-Konfiguration (`/api/v1/site`) als Fallback verwendet.
