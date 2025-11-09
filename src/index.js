/**
 * AR Studio Cloudflare Workers API
 * Provides backend services for scene storage and asset management
 */

// CORS headers helper
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS preflight requests
function handleOptions(request) {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

// Generate a random short ID
function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Scene handlers
async function handleSceneList(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, description, thumbnail, created_at, updated_at, views, published FROM scenes WHERE published = 1 ORDER BY updated_at DESC LIMIT 50'
  ).all();
  
  return new Response(JSON.stringify({ scenes: results }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

async function handleSceneGet(env, id) {
  const scene = await env.DB.prepare(
    'SELECT * FROM scenes WHERE id = ?'
  ).bind(id).first();
  
  if (!scene) {
    return new Response(JSON.stringify({ error: 'Scene not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
  
  // Increment view count
  await env.DB.prepare(
    'UPDATE scenes SET views = views + 1 WHERE id = ?'
  ).bind(id).run();
  
  return new Response(JSON.stringify({ 
    scene: {
      ...scene,
      scene_data: JSON.parse(scene.scene_data)
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

async function handleSceneCreate(env, request) {
  const body = await request.json();
  const { name, description, scene_data, thumbnail } = body;
  
  if (!name || !scene_data) {
    return new Response(JSON.stringify({ error: 'Missing required fields: name, scene_data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
  
  const id = generateId();
  const now = Date.now();
  
  await env.DB.prepare(
    'INSERT INTO scenes (id, name, description, scene_data, thumbnail, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    name,
    description || '',
    JSON.stringify(scene_data),
    thumbnail || '',
    now,
    now
  ).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    id,
    url: `/api/scenes/${id}`
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

async function handleSceneUpdate(env, id, request) {
  const body = await request.json();
  const { name, description, scene_data, thumbnail, published } = body;
  
  // Check if scene exists
  const existing = await env.DB.prepare('SELECT id FROM scenes WHERE id = ?').bind(id).first();
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Scene not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
  
  const updates = [];
  const bindings = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    bindings.push(name);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    bindings.push(description);
  }
  if (scene_data !== undefined) {
    updates.push('scene_data = ?');
    bindings.push(JSON.stringify(scene_data));
  }
  if (thumbnail !== undefined) {
    updates.push('thumbnail = ?');
    bindings.push(thumbnail);
  }
  if (published !== undefined) {
    updates.push('published = ?');
    bindings.push(published ? 1 : 0);
  }
  
  updates.push('updated_at = ?');
  bindings.push(Date.now());
  
  bindings.push(id);
  
  await env.DB.prepare(
    `UPDATE scenes SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...bindings).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

async function handleSceneDelete(env, id) {
  const result = await env.DB.prepare(
    'DELETE FROM scenes WHERE id = ?'
  ).bind(id).run();
  
  if (result.changes === 0) {
    return new Response(JSON.stringify({ error: 'Scene not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

// Asset upload handler (stores in KV)
async function handleAssetUpload(env, request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const fileType = formData.get('type') || 'model';
  const sceneId = formData.get('scene_id');
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
  
  const id = generateId();
  const storageKey = `asset_${id}`;
  const arrayBuffer = await file.arrayBuffer();
  
  // Store in KV
  await env.ASSETS.put(storageKey, arrayBuffer, {
    metadata: {
      filename: file.name,
      mimeType: file.type,
      uploadedAt: Date.now()
    }
  });
  
  // Store metadata in DB
  await env.DB.prepare(
    'INSERT INTO assets (id, filename, file_type, mime_type, file_size, storage_key, uploaded_at, scene_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    file.name,
    fileType,
    file.type,
    arrayBuffer.byteLength,
    storageKey,
    Date.now(),
    sceneId || null
  ).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    id,
    url: `/api/assets/${id}`,
    filename: file.name
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

// Asset retrieval handler
async function handleAssetGet(env, id) {
  const asset = await env.DB.prepare(
    'SELECT * FROM assets WHERE id = ?'
  ).bind(id).first();
  
  if (!asset) {
    return new Response('Asset not found', { status: 404 });
  }
  
  const data = await env.ASSETS.get(asset.storage_key, { type: 'arrayBuffer' });
  
  if (!data) {
    return new Response('Asset data not found', { status: 404 });
  }
  
  return new Response(data, {
    headers: {
      'Content-Type': asset.mime_type,
      'Cache-Control': 'public, max-age=31536000',
      ...corsHeaders()
    }
  });
}

// Main request router
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      });
    }
    
    // Scenes API
    if (url.pathname === '/api/scenes' && request.method === 'GET') {
      return handleSceneList(env);
    }
    
    if (url.pathname === '/api/scenes' && request.method === 'POST') {
      return handleSceneCreate(env, request);
    }
    
    const sceneMatch = url.pathname.match(/^\/api\/scenes\/([^\/]+)$/);
    if (sceneMatch) {
      const sceneId = sceneMatch[1];
      if (request.method === 'GET') {
        return handleSceneGet(env, sceneId);
      }
      if (request.method === 'PUT') {
        return handleSceneUpdate(env, sceneId, request);
      }
      if (request.method === 'DELETE') {
        return handleSceneDelete(env, sceneId);
      }
    }
    
    // Assets API
    if (url.pathname === '/api/assets' && request.method === 'POST') {
      return handleAssetUpload(env, request);
    }
    
    const assetMatch = url.pathname.match(/^\/api\/assets\/([^\/]+)$/);
    if (assetMatch) {
      const assetId = assetMatch[1];
      if (request.method === 'GET') {
        return handleAssetGet(env, assetId);
      }
    }
    
    return new Response('Not found', { status: 404 });
  }
};
