# Cloudflare Backend Setup Guide

This guide will help you set up the Cloudflare backend for the AR Studio Lite editor.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Node.js installed (v16 or higher)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

## Step 3: Create D1 Database

```bash
npx wrangler d1 create ar-studio-db
```

Copy the database ID from the output and update `wrangler.toml`:
- Replace `placeholder-id` in the `database_id` field with your actual database ID

## Step 4: Create KV Namespace for Assets

```bash
npx wrangler kv:namespace create "ASSETS"
```

Copy the namespace ID from the output and update `wrangler.toml`:
- Replace `placeholder-id` in the KV namespace `id` field with your actual namespace ID

## Step 5: Initialize Database Schema

```bash
npm run db:init
```

This will create the necessary tables in your D1 database.

## Step 6: Test Locally (Optional)

```bash
npm run dev
```

This starts a local development server. You can test the API at `http://localhost:8787`

## Step 7: Deploy to Cloudflare

```bash
npm run deploy
```

After deployment, you'll get a URL like `https://ar-studio-backend.YOUR-SUBDOMAIN.workers.dev`

## Step 8: Update Frontend Configuration

Create a `config.js` file in the root directory with your Worker URL:

```javascript
window.AR_STUDIO_CONFIG = {
  API_URL: 'https://ar-studio-backend.YOUR-SUBDOMAIN.workers.dev'
};
```

Or update the `API_URL` constant in `editor.html` and viewers.

## API Endpoints

### Scenes

- `GET /api/scenes` - List all public scenes
- `GET /api/scenes/:id` - Get a specific scene
- `POST /api/scenes` - Create a new scene
- `PUT /api/scenes/:id` - Update a scene
- `DELETE /api/scenes/:id` - Delete a scene

### Assets

- `POST /api/assets` - Upload an asset (multipart/form-data)
- `GET /api/assets/:id` - Download an asset

## Cost Considerations

All services used are within Cloudflare's free tier:

- **Workers**: 100,000 requests/day (free)
- **D1**: 5 GB storage, 5 million reads/day (free)
- **KV**: 100,000 reads/day, 1,000 writes/day (free)
- **R2** (optional): 10 GB storage/month (free)

For most personal and small team usage, you will stay within these limits.

## Troubleshooting

### Database not found error
Make sure you've run `npm run db:init` and the database ID in `wrangler.toml` matches your actual D1 database.

### CORS errors
Check that the CORS headers are properly configured in `src/index.js`. The default configuration allows all origins (`*`).

### Asset upload fails
Ensure your KV namespace is properly configured and the namespace ID in `wrangler.toml` is correct.

## Next Steps

- Customize the frontend to use the new backend API
- Add user authentication (optional)
- Set up custom domain for your worker (optional)
- Configure caching rules for better performance
