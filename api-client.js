/**
 * AR Studio API Client
 * Handles communication with Cloudflare Workers backend
 */

// Configuration - update this with your Worker URL after deployment
const API_CONFIG = {
  // Use local API URL if available (for development)
  API_URL: window.AR_STUDIO_CONFIG?.API_URL || 'http://localhost:8787',
  // Fallback to relative path if running on same domain
  USE_RELATIVE: false
};

class ARStudioAPI {
  constructor() {
    this.baseUrl = API_CONFIG.API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Scene methods
  async listScenes() {
    return this.request('/api/scenes');
  }

  async getScene(id) {
    return this.request(`/api/scenes/${id}`);
  }

  async createScene(sceneData) {
    return this.request('/api/scenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sceneData)
    });
  }

  async updateScene(id, sceneData) {
    return this.request(`/api/scenes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sceneData)
    });
  }

  async deleteScene(id) {
    return this.request(`/api/scenes/${id}`, {
      method: 'DELETE'
    });
  }

  // Asset methods
  async uploadAsset(file, type = 'model', sceneId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (sceneId) {
      formData.append('scene_id', sceneId);
    }

    return this.request('/api/assets', {
      method: 'POST',
      body: formData
    });
  }

  getAssetUrl(assetId) {
    return `${this.baseUrl}/api/assets/${assetId}`;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
window.arStudioAPI = new ARStudioAPI();
