Kurzanleitung — BestellApp

Voraussetzungen

- Ein moderner Browser
- Optional: Python 3 zur Lokalen Vorschau (siehe unten)

Start lokal

1. Wechsle in das `www` Verzeichnis:

```powershell
Set-Location -Path 'C:\Users\RaphaelNeuberger\OneDrive - ENERQI ACADEMY Ltd\Desktop\Developer Akademie\Frontend Module\Modul 7 - JavaScript Projekte\04 Bestellapp\www'
```

2. Starte einen einfachen HTTP-Server (Python 3):

```powershell
python -m http.server 8000
```

3. Öffne im Browser: http://localhost:8000

Kurz-Checks

- Kategorien: Vorspeisen, Suppen, Salate, Sushi - Maki, Desserts, Getränke sollten als H2 und Nav-Einträge vorhanden sein.
- Artikel: Die Seite rendert Menüartikel aus `scripts/templates.js`.
- Warenkorb:
  - Klicke '+' bei einem Artikel → Anzahl erhöht sich, Drawer öffnet, Sticky mini-cart erscheint.
  - `localStorage`-Key: `vina_cart_v1` enthält die Artikel.

Accessibility

- Drawer ist als `role="dialog"` markiert; Fokus wird beim Öffnen eingeschränkt (trapFocus).
- `aria-live` Regionen für Cart-Counts vorhanden.

Fehlendes / empfohlene Verbesserungen

- Farbkontrast-Tests (Lighthouse) empfohlen
- Unit-Tests: Keine vorhanden

Wenn du willst, führe ich automatische Smoke-Tests oder ergänze das Accessibility-Review.
