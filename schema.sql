-- AR Studio Database Schema for Cloudflare D1

-- Scenes table: stores AR scene configurations
CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    scene_data TEXT NOT NULL, -- JSON string of the scene configuration
    thumbnail TEXT, -- URL or base64 of preview image
    created_at INTEGER NOT NULL, -- Unix timestamp
    updated_at INTEGER NOT NULL, -- Unix timestamp
    views INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1 -- 1 for public, 0 for private
);

-- Assets table: stores metadata for uploaded assets
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'model', 'image', 'audio'
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_key TEXT NOT NULL, -- KV key or R2 path
    uploaded_at INTEGER NOT NULL,
    scene_id TEXT, -- Optional: link to a specific scene
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scenes_created ON scenes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_updated ON scenes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_published ON scenes(published);
CREATE INDEX IF NOT EXISTS idx_assets_scene ON assets(scene_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(file_type);
