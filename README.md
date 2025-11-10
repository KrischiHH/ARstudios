# AR Studio - Moderner Web-AR-Editor mit Cloudflare Backend

**Modern webbasierter AR-Editor angelehnt an Adobe Aero / ARstudio**

Erstelle, bearbeite und teile AR-Szenen direkt im Browser mit persistenter Speicherung über Cloudflare Workers.

## 🚀 Features

- ✅ Intuitive Web-GUI zur Erstellung und Bearbeitung von AR-Szenen
- ✅ 3D-Vorschau im Editor mit Three.js
- ✅ Image Tracking (MindAR + A-Frame)
- ✅ Surface Placement (WebXR Hit-Test)
- ✅ **Cloud-Speicherung über Cloudflare Workers (D1 + KV)**
- ✅ Szenen teilen via QR-Code oder Link
- ✅ Asset-Upload & Verwaltung
- ✅ Vollständig kostenneutral (Cloudflare Free-Tier)

## 📁 Projektstruktur

### Frontend (Statisch - GitHub Pages)
- `editor.html` – Lokaler Editor (funktioniert ohne Backend)
- `editor-cloud.html` – Cloud-Editor mit Backend-Integration ⭐
- `image-viewer.html` / `image-viewer-cloud.html` – Image-Tracking Viewer
- `surface-viewer.html` / `surface-viewer-cloud.html` – Surface AR Viewer
- `api-client.js` – API Client für Cloudflare Backend
- `index.html` – Redirect auf Editor

### Backend (Cloudflare Workers)
- `src/index.js` – Cloudflare Worker mit API-Endpunkten
- `schema.sql` – D1 Datenbankschema
- `wrangler.toml` – Cloudflare Workers Konfiguration
- `package.json` – Dependencies

## 🛠️ Setup & Deployment

### Option 1: Nur Frontend (ohne Cloud-Backend)

Verwende die vorhandenen Files (`editor.html`, `image-viewer.html`, `surface-viewer.html`). 
Diese funktionieren vollständig statisch über GitHub Pages:

1. Repository auf GitHub pushen
2. GitHub Pages aktivieren (Settings → Pages)
3. URL öffnen: `https://<USERNAME>.github.io/<REPO>/editor.html`

### Option 2: Mit Cloudflare Backend (empfohlen)

Für persistente Speicherung und Szenen-Sharing siehe: **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)**

**Schnellstart:**

```bash
# 1. Dependencies installieren
npm install

# 2. Bei Cloudflare einloggen
npx wrangler login

# 3. D1 Datenbank erstellen
npx wrangler d1 create ar-studio-db

# 4. KV Namespace erstellen
npx wrangler kv:namespace create "ASSETS"

# 5. IDs in wrangler.toml eintragen

# 6. Datenbank initialisieren
npm run db:init

# 7. Deploy
npm run deploy
```

Nach dem Deployment die Worker-URL in `api-client.js` eintragen oder `config.js` erstellen.

## 💡 Nutzung

### Cloud-Editor verwenden
1. Öffne `editor-cloud.html` in einem Browser
2. Erstelle eine AR-Szene (3D-Modell, Position, etc.)
3. Klicke "☁️ In Cloud speichern"
4. Teile die Szene via:
   - QR-Code
   - Direktlink mit Scene-ID: `image-viewer-cloud.html?id=abc123`

### Lokaler Editor (ohne Backend)
1. Öffne `editor.html`
2. Szene erstellen
3. "Öffnen: Image-AR" oder "Öffnen: Surface-AR"
4. Szene wird als Base64 im URL-Parameter übergeben

## 🏗️ Architektur

```
┌─────────────────────────────────────────┐
│  Frontend (GitHub Pages / Static Host)  │
│  - editor-cloud.html                     │
│  - image-viewer-cloud.html               │
│  - surface-viewer-cloud.html             │
│  - api-client.js                         │
└────────────┬────────────────────────────┘
             │ HTTPS / CORS
┌────────────▼────────────────────────────┐
│  Cloudflare Workers (API)               │
│  - REST API für CRUD-Operationen        │
│  - Asset-Upload/-Download               │
└────────────┬────────────────────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
┌─────────┐    ┌──────────┐
│ D1 (DB) │    │ KV/R2    │
│ Scenes  │    │ Assets   │
└─────────┘    └──────────┘
```

## 🔧 API-Endpunkte

### Szenen
- `GET /api/scenes` - Liste aller öffentlichen Szenen
- `GET /api/scenes/:id` - Einzelne Szene abrufen
- `POST /api/scenes` - Neue Szene erstellen
- `PUT /api/scenes/:id` - Szene aktualisieren
- `DELETE /api/scenes/:id` - Szene löschen

### Assets
- `POST /api/assets` - Asset hochladen (GLB, Audio, Bilder)
- `GET /api/assets/:id` - Asset herunterladen

## 💰 Kosten (Cloudflare Free Tier)

- **Workers**: 100.000 Requests/Tag ✅
- **D1**: 5 GB Storage, 5 Mio. Reads/Tag ✅
- **KV**: 100.000 Reads/Tag, 1.000 Writes/Tag ✅

→ **Für persönliche Nutzung und kleine Teams komplett kostenlos!**

## 📱 Browser-Kompatibilität

- **Editor**: Alle modernen Browser (Chrome, Firefox, Safari, Edge)
- **Image-AR**: Benötigt Kamerazugriff (HTTPS erforderlich)
- **Surface-AR**: 
  - WebXR-AR: Android Chrome
  - Fallback: iOS (Quick Look) via `<model-viewer>`

## 🎨 Anpassungen

### Frontend-Styling
Farben und Layout in `<style>` Sektion der HTML-Dateien anpassen.

### Backend-Konfiguration
- CORS-Origins in `src/index.js` anpassen
- Rate-Limiting hinzufügen (optional)
- Authentifizierung einbauen (optional)

## 📝 Lizenz

MIT License - Frei für kommerzielle und private Nutzung

## 🤝 Beitragen

Pull Requests sind willkommen! Für größere Änderungen bitte vorher ein Issue öffnen.

## 🔗 Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [WebXR Device API](https://immersiveweb.dev/)
- [MindAR](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js](https://threejs.org/)
- [A-Frame](https://aframe.io/)

## Schnellstart (ohne Backend)

1. Neues Repo erstellen (z. B. `ar-studio-lite`).
2. **Alle Dateien** dieses Ordners pushen.
3. Öffne **Settings → Pages → Build and deployment → GitHub Actions** (oder „Deploy from a branch").
4. Warte auf den Workflow „Deploy Pages". Danach läuft es unter:  
   `https://<USERNAME>.github.io/<REPO>/editor.html`

> HTTPS ist automatisch aktiv – nötig für Kamera & WebXR.

## Hinweise

- Öffne **`editor-cloud.html`** für Cloud-Funktionalität oder **`editor.html`** für lokale Nutzung
- QR‑Button generiert Links, die direkt auf die Viewer zeigen
- Große GLB/Assets (>20 MB) besser extern hosten (CORS beachten) oder komprimieren (Draco/meshopt)
- Für Produktivbetrieb: Custom Domain über Cloudflare Pages einrichten
