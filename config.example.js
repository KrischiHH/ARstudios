/**
 * Configuration file for AR Studio
 * 
 * Copy this file to 'config.js' and update with your Cloudflare Worker URL
 */

window.AR_STUDIO_CONFIG = {
  // Your Cloudflare Worker URL (after deployment)
  // Example: 'https://ar-studio-backend.your-subdomain.workers.dev'
  API_URL: 'http://localhost:8787',
  
  // Optional: Custom settings
  MAX_ASSET_SIZE: 10 * 1024 * 1024, // 10 MB
  SUPPORTED_MODEL_FORMATS: ['.glb', '.gltf'],
  SUPPORTED_IMAGE_FORMATS: ['.png', '.jpg', '.jpeg'],
  SUPPORTED_AUDIO_FORMATS: ['.mp3', '.wav', '.ogg']
};
