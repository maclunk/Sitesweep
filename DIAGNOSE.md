# Diagnose: SiteSweep Performance & Stabilität

## Hauptprobleme identifiziert:

1. **Crawler-Performance:**
   - MAX_PAGES = 15 (zu hoch, sollte 8-10 sein)
   - PAGE_TIMEOUT = 20s (zu hoch, sollte 10s sein)
   - Keine strikte Begrenzung der Crawl-Tiefe

2. **Worker-Stabilität:**
   - Timeout von 5 Minuten ist zu lang
   - Logging könnte besser sein
   - Worker könnte bei schweren Fehlern hängen bleiben

3. **Admin-Performance:**
   - Issues werden bereits nicht mehr geladen (gut)
   - Detail-API lädt möglicherweise zu viel
   - Keine Pagination

4. **Frontend:**
   - Kein Timeout für lange Scans
   - Polling-Intervall könnte optimiert werden

## Lösungsansatz:

1. Crawler: Reduziere MAX_PAGES auf 10, PAGE_TIMEOUT auf 10s
2. Worker: Besseres Error-Handling, kürzeres Timeout
3. Admin: Weitere Optimierungen bei Detail-API
4. Frontend: Timeout-Logik hinzufügen

