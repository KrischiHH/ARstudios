# AR Studio - Deployment & Testing Guide

This guide walks you through deploying and testing the AR Studio application with Cloudflare backend.

## Prerequisites

- Node.js v16+ installed
- A Cloudflare account (free tier)
- Git installed
- A modern web browser

## Part 1: Deploy Frontend to GitHub Pages

### Step 1: Push to GitHub

```bash
# If not already done
git init
git add .
git commit -m "Initial AR Studio setup"
git remote add origin https://github.com/YOUR_USERNAME/ARstudios.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
4. Click **Save**
5. Wait a few minutes for deployment
6. Access at: `https://YOUR_USERNAME.github.io/ARstudios/`

### Step 3: Test Local Editor (No Backend Required)

Open in browser: `https://YOUR_USERNAME.github.io/ARstudios/editor.html`

This version works completely offline using URL-encoded scenes.

## Part 2: Deploy Cloudflare Backend (Optional but Recommended)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window. Authorize the connection.

### Step 3: Create D1 Database

```bash
npx wrangler d1 create ar-studio-db
```

**Output example:**
```
✅ Successfully created DB 'ar-studio-db'
binding = "DB"
database_name = "ar-studio-db"
database_id = "abc123-def456-..."
```

Copy the `database_id` value.

### Step 4: Create KV Namespace

```bash
npx wrangler kv:namespace create "ASSETS"
```

**Output example:**
```
✅ Successfully created KV namespace
id = "xyz789abc123..."
```

Copy the `id` value.

### Step 5: Update wrangler.toml

Open `wrangler.toml` and replace the placeholder IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "ar-studio-db"
database_id = "YOUR_D1_DATABASE_ID_HERE"

[[kv_namespaces]]
binding = "ASSETS"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

### Step 6: Initialize Database

```bash
npm run db:init
```

This creates the necessary tables in your D1 database.

### Step 7: Deploy Worker

```bash
npm run deploy
```

**Output example:**
```
✨ Successfully published your Worker
https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev
```

Copy this URL - this is your **API_URL**.

### Step 8: Configure Frontend

Option A: Create `config.js` file (not tracked by git):

```bash
cat > config.js << 'EOF'
window.AR_STUDIO_CONFIG = {
  API_URL: 'https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev'
};
EOF
```

Option B: Edit `api-client.js` directly:

```javascript
const API_CONFIG = {
  API_URL: 'https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev',
  USE_RELATIVE: false
};
```

### Step 9: Push Updated Frontend

```bash
git add .
git commit -m "Configure Cloudflare backend URL"
git push
```

Wait for GitHub Pages to redeploy (1-2 minutes).

## Part 3: Testing

### Test 1: Backend Health Check

```bash
curl https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev/api/health
```

Expected: `{"status":"ok"}`

### Test 2: Create a Scene via API

```bash
curl -X POST https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev/api/scenes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Scene",
    "description": "My first AR scene",
    "scene_data": {
      "meta": {"name": "Test", "version": 1},
      "anchor": {"type": "surface"},
      "nodes": [{
        "id": "test",
        "type": "model",
        "src": "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        "transform": {"position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1]}
      }]
    }
  }'
```

Expected: `{"success":true,"id":"abc123xyz","url":"/api/scenes/abc123xyz"}`

### Test 3: Retrieve the Scene

```bash
curl https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev/api/scenes/abc123xyz
```

Expected: JSON with scene data

### Test 4: List All Scenes

```bash
curl https://ar-studio-backend.YOUR_SUBDOMAIN.workers.dev/api/scenes
```

Expected: `{"scenes":[...]}`

### Test 5: Cloud Editor UI

1. Open: `https://YOUR_USERNAME.github.io/ARstudios/editor-cloud.html`
2. Wait for "☁️ Cloud-Backend verbunden" message (bottom right)
3. Create a simple scene
4. Click "☁️ In Cloud speichern"
5. Enter a name and click "Speichern"
6. Check for success message with scene ID
7. Click "☁️ Aus Cloud laden"
8. Verify your scene appears in the list
9. Click on it to load

### Test 6: Sharing Cloud Scenes

1. After saving a scene, click "QR-Code"
2. QR code should show a URL with `?id=...` (not long base64)
3. Scan with mobile device or copy the "Direktlink"
4. Scene should load in the viewer

### Test 7: Mobile AR Testing

**For Image AR:**
1. Save a scene with anchor type = "image"
2. Open the QR code or direct link on a mobile device
3. Point camera at a flat image/card
4. 3D model should appear on the image

**For Surface AR:**
1. Save a scene with anchor type = "surface"
2. Open the QR code or direct link on Android Chrome
3. Point camera at a flat surface (floor, table)
4. Tap to place the 3D model

## Troubleshooting

### "Backend nicht erreichbar" Error

**Cause:** Frontend can't connect to Worker
**Solutions:**
- Verify Worker is deployed: `npx wrangler deploy`
- Check API_URL is correct in `api-client.js` or `config.js`
- Verify CORS headers in `src/index.js`
- Check browser console for exact error

### "Database not found" Error

**Cause:** D1 database not initialized
**Solution:**
```bash
npm run db:init
npx wrangler deploy
```

### Worker Deployment Fails

**Cause:** Missing IDs in wrangler.toml
**Solution:**
- Verify `database_id` and KV `id` are filled in
- Run `npx wrangler d1 list` to see your databases
- Run `npx wrangler kv:namespace list` to see your KV namespaces

### Scenes Don't Save

**Causes:**
1. Backend not configured properly
2. Database schema not initialized
3. KV namespace not created

**Solution:**
```bash
# Re-run setup
npx wrangler d1 execute ar-studio-db --file=./schema.sql
npx wrangler deploy
```

### Assets Upload Fails

**Cause:** KV namespace not configured
**Solution:**
- Verify KV namespace exists: `npx wrangler kv:namespace list`
- Check `wrangler.toml` has correct KV ID
- Redeploy: `npx wrangler deploy`

### CORS Errors in Browser

**Cause:** Browser blocking cross-origin requests
**Solution:**
- Verify Worker is on HTTPS
- Check `corsHeaders()` function in `src/index.js`
- Make sure `Access-Control-Allow-Origin: *` is set

## Performance Tips

### For Frontend
- Enable browser caching
- Compress 3D models using Draco or meshopt
- Use CDN for large assets
- Lazy load heavy libraries

### For Backend
- Enable Cloudflare Caching for assets
- Add rate limiting for public endpoints
- Use D1 indexes for faster queries
- Implement pagination for scene lists

## Monitoring

### View Worker Logs
```bash
npx wrangler tail
```

### Check Usage Stats
1. Go to Cloudflare Dashboard
2. Workers & Pages → Your Worker
3. View metrics: requests, errors, CPU time

### Database Usage
```bash
# Count scenes
npx wrangler d1 execute ar-studio-db --command="SELECT COUNT(*) FROM scenes"

# List recent scenes
npx wrangler d1 execute ar-studio-db --command="SELECT id, name, created_at FROM scenes ORDER BY created_at DESC LIMIT 10"
```

## Next Steps

- Add authentication (Cloudflare Access or custom)
- Implement asset compression
- Add scene versioning
- Create scene templates
- Add analytics/tracking
- Set up custom domain
- Add collaborative editing

## Support

For issues or questions:
- Check the README.md
- Review CLOUDFLARE_SETUP.md
- Open an issue on GitHub
- Check Cloudflare Workers documentation

## Production Checklist

Before going to production:

- [ ] Custom domain configured
- [ ] CORS origins restricted to your domain
- [ ] Rate limiting implemented
- [ ] Error logging set up
- [ ] Database backups configured
- [ ] Analytics integrated
- [ ] Privacy policy created
- [ ] Terms of service added
- [ ] Performance testing completed
- [ ] Mobile testing on iOS and Android
- [ ] Security review completed
