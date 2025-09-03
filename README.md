# AR Studio Lite (GitHub Pages)

**Editor + WebAR Viewer (Image / Surface) – komplett statisch, ideal für GitHub Pages.**

## Schnellstart
1. Neues Repo erstellen (z. B. `ar-studio-lite`).
2. **Alle Dateien** dieses Ordners pushen.
3. Öffne **Settings → Pages → Build and deployment → GitHub Actions** (oder „Deploy from a branch“).
4. Warte auf den Workflow „Deploy Pages“. Danach läuft es unter:  
   `https://<USERNAME>.github.io/<REPO>/editor.html`

> HTTPS ist automatisch aktiv – nötig für Kamera & WebXR.

## Dateien
- `editor.html` – Mini‑Editor mit Vorschau + „Open in Image‑AR“ / „Open in Surface‑AR“ + QR‑Code.
- `image-viewer.html` – Image‑Tracking mit MindAR + A‑Frame.
- `surface-viewer.html` – Surface‑Placement mit WebXR Hit‑Test + Fallback via `<model-viewer>`.
- `index.html` – Redirect auf `editor.html`.
- `.github/workflows/pages.yml` – Auto‑Deploy auf GitHub Pages.
- `.nojekyll` – Deaktiviert Jekyll‑Special‑Cases.

## Hinweise
- Öffne **`editor.html`** auch mobil – QR‑Button generiert Links, die direkt auf die Viewer zeigen.
- Große GLB/Assets (>20 MB) besser extern hosten (CORS beachten) oder komprimieren (Draco/meshopt).
