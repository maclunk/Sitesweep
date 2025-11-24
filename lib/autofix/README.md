# AutoFix-System

Das AutoFix-System ermöglicht es, automatisch generierte Fix-Vorschläge für gefundene Issues zu erstellen und anzuwenden.

## Struktur

- `issues.ts` - Mapping von Issue-IDs zu AutoFix-Funktionen und Kontext-Informationen
- `suggestFix.ts` - GPT-basierte Generierung von Fix-Vorschlägen
- `applyPatch.ts` - Anwenden von HTML-Patches auf Content

## API-Endpunkte

### POST `/api/fix/suggest`
Generiert einen Fix-Vorschlag für ein Issue.

**Request:**
```json
{
  "scanJobId": "string",
  "issueId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patch": "string (HTML-Patch)",
    "explanation": "string",
    "preview": "string (optional)"
  }
}
```

### POST `/api/fix/apply`
Wendet einen Patch auf HTML-Content an.

**Request:**
```json
{
  "scanJobId": "string",
  "issueId": "string",
  "patch": "string",
  "originalContent": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "patchedContent": "string",
    "message": "string"
  }
}
```

## Umgebungsvariablen

Erforderlich in `.env`:
```
OPENAI_API_KEY=sk-...
```

## Unterstützte Issues

- `missing-title` - Fehlender Title-Tag
- `missing-meta-description` - Fehlende Meta-Description
- `missing-responsive-meta` - Fehlendes Viewport-Meta-Tag
- `seo_missing_canonical` - Fehlendes Canonical-Tag
- `seo_missing_og_tags` - Fehlende Open-Graph-Tags
- `seo_missing_lang_attr` - Fehlendes lang-Attribut
- `ux_missing_favicon` - Fehlendes Favicon
- `multiple-h1` - Mehrere H1-Tags
- `missing-alt-tags` - Fehlende alt-Attribute

## Verwendung

1. Navigiere zu `/autofix?jobId=<scanJobId>`
2. Wähle ein Issue aus
3. Klicke auf "Fix generieren"
4. Prüfe den generierten Patch
5. Klicke auf "Fix anwenden" (optional)

**Wichtig:** Patches werden NIE automatisch angewendet - immer manuelle Bestätigung erforderlich!

