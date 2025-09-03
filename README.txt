AR Studio Lite – Hello‑World Paket
===================================
Dieses Starter‑Kit liefert:
1) **editor.html** – Mini‑Editor (JSON‑basiert), Preview & Publish (Link + QR).
2) **image-viewer.html** – Image‑Tracking (MindAR + A‑Frame) Viewer.
3) **surface-viewer.html** – Surface/World‑Platzierung (WebXR Hit‑Test) + Fallback via `<model-viewer>`.

Schnellstart
------------
1. Lade das ZIP herunter und entpacke es in einen Ordner.
2. Öffne **editor.html** im Browser (am besten Chrome/Edge). 
3. Klicke „Beispiel laden“, dann „Öffnen: Image‑AR“ oder „Öffnen: Surface‑AR“.
4. Für Image‑AR richte die Kamera auf das angezeigte Beispiel‑Target (Karte).

Hinweise
--------
- **Image‑AR** nutzt die offiziellen MindAR‑Beispielassets (card.mind + card.png) direkt vom CDN.
- **Surface‑AR (WebXR)** läuft auf Chrome/Android. Auf iOS greift automatisch der **Fallback** via `<model-viewer>` (Scene Viewer / QuickLook).
- Modelle (GLB/GLTF) sollten CORS‑fähig gehostet sein. Beispiel: `https://modelviewer.dev/shared-assets/models/Astronaut.glb`.

Nächste Schritte
----------------
- Node‑Editor ausbauen (mehrere Nodes, Materialien, Keyframes).
- Events/Actions erweitern (onEnterTarget, onExitTarget, onTap -> Animation/Audio).
- Asset‑Library + Upload (z.B. via Supabase/Firebase).
- „Publish“ als permanente URL (Projekt‑IDs, QR‑Codes serverseitig).
