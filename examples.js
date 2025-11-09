/**
 * AR Studio API - Usage Examples
 * 
 * This file demonstrates how to use the AR Studio API programmatically.
 * Can be used for automation, testing, or building custom integrations.
 */

// Import the API client (in browser or Node.js with fetch polyfill)
// In browser: <script src="api-client.js"></script>
// In Node.js: Implement similar class with node-fetch

// Example 1: Create a new AR scene
async function createSimpleScene() {
  const api = window.arStudioAPI; // or new ARStudioAPI() in Node.js
  
  const sceneData = {
    name: "My Astronaut Scene",
    description: "A simple AR scene with an astronaut model",
    scene_data: {
      meta: {
        name: "Astronaut Demo",
        version: 1,
        author: "Your Name"
      },
      anchor: {
        type: "surface" // or "image"
      },
      nodes: [
        {
          id: "astronaut",
          type: "model",
          src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [0.5, 0.5, 0.5]
          },
          behaviors: [
            {
              on: "onStart",
              action: "playAnimation",
              clip: "__all__"
            }
          ]
        }
      ]
    }
  };
  
  try {
    const result = await api.createScene(sceneData);
    console.log("Scene created:", result);
    console.log("Scene ID:", result.id);
    console.log("Scene URL:", result.url);
    return result.id;
  } catch (error) {
    console.error("Failed to create scene:", error);
  }
}

// Example 2: Load and modify an existing scene
async function loadAndModifyScene(sceneId) {
  const api = window.arStudioAPI;
  
  try {
    // Load the scene
    const result = await api.getScene(sceneId);
    const scene = result.scene;
    
    console.log("Loaded scene:", scene.name);
    console.log("Scene data:", scene.scene_data);
    
    // Modify the scene (e.g., change model scale)
    scene.scene_data.nodes[0].transform.scale = [1, 1, 1]; // Make it bigger
    
    // Update the scene
    await api.updateScene(sceneId, {
      scene_data: scene.scene_data,
      name: scene.name + " (Modified)"
    });
    
    console.log("Scene updated successfully");
  } catch (error) {
    console.error("Failed to modify scene:", error);
  }
}

// Example 3: List all public scenes
async function listAllScenes() {
  const api = window.arStudioAPI;
  
  try {
    const result = await api.listScenes();
    console.log(`Found ${result.scenes.length} scenes:`);
    
    result.scenes.forEach((scene, index) => {
      console.log(`${index + 1}. ${scene.name} (ID: ${scene.id})`);
      console.log(`   Description: ${scene.description || 'N/A'}`);
      console.log(`   Views: ${scene.views || 0}`);
      console.log(`   Updated: ${new Date(scene.updated_at).toLocaleString()}`);
    });
    
    return result.scenes;
  } catch (error) {
    console.error("Failed to list scenes:", error);
  }
}

// Example 4: Create scene with custom image tracking target
async function createImageTrackingScene() {
  const api = window.arStudioAPI;
  
  const sceneData = {
    name: "Image Tracking Demo",
    description: "AR scene that appears when tracking a specific image",
    scene_data: {
      meta: {
        name: "Image Tracking",
        version: 1
      },
      anchor: {
        type: "image",
        src: "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png"
      },
      nodes: [
        {
          id: "model",
          type: "model",
          src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [0.3, 0.3, 0.3]
          }
        }
      ]
    }
  };
  
  try {
    const result = await api.createScene(sceneData);
    console.log("Image tracking scene created:", result.id);
    return result.id;
  } catch (error) {
    console.error("Failed to create image tracking scene:", error);
  }
}

// Example 5: Generate shareable links
function generateShareableLinks(sceneId) {
  const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  
  const imageViewerUrl = `${baseUrl}image-viewer-cloud.html?id=${sceneId}`;
  const surfaceViewerUrl = `${baseUrl}surface-viewer-cloud.html?id=${sceneId}`;
  
  console.log("Image AR Link:", imageViewerUrl);
  console.log("Surface AR Link:", surfaceViewerUrl);
  
  return {
    imageAR: imageViewerUrl,
    surfaceAR: surfaceViewerUrl
  };
}

// Example 6: Upload a 3D model asset (if you have a file input)
async function uploadModelAsset(file, sceneId) {
  const api = window.arStudioAPI;
  
  try {
    const result = await api.uploadAsset(file, 'model', sceneId);
    console.log("Asset uploaded:", result);
    console.log("Asset URL:", api.getAssetUrl(result.id));
    return api.getAssetUrl(result.id);
  } catch (error) {
    console.error("Failed to upload asset:", error);
  }
}

// Example 7: Delete a scene
async function deleteScene(sceneId) {
  const api = window.arStudioAPI;
  
  try {
    await api.deleteScene(sceneId);
    console.log("Scene deleted successfully");
  } catch (error) {
    console.error("Failed to delete scene:", error);
  }
}

// Example 8: Check backend health
async function checkBackendHealth() {
  const api = window.arStudioAPI;
  
  const isHealthy = await api.healthCheck();
  console.log("Backend status:", isHealthy ? "✅ Online" : "❌ Offline");
  return isHealthy;
}

// Example 9: Batch create scenes from templates
async function batchCreateScenes(templates) {
  const api = window.arStudioAPI;
  const results = [];
  
  for (const template of templates) {
    try {
      const result = await api.createScene(template);
      results.push({ success: true, id: result.id, name: template.name });
      console.log(`✅ Created: ${template.name} (${result.id})`);
    } catch (error) {
      results.push({ success: false, name: template.name, error: error.message });
      console.error(`❌ Failed: ${template.name}`, error);
    }
  }
  
  return results;
}

// Example 10: Monitor scene views
async function getSceneStats(sceneId) {
  const api = window.arStudioAPI;
  
  try {
    const result = await api.getScene(sceneId);
    const scene = result.scene;
    
    const stats = {
      id: scene.id,
      name: scene.name,
      views: scene.views || 0,
      created: new Date(scene.created_at).toLocaleString(),
      updated: new Date(scene.updated_at).toLocaleString(),
      published: scene.published === 1
    };
    
    console.log("Scene Stats:", stats);
    return stats;
  } catch (error) {
    console.error("Failed to get scene stats:", error);
  }
}

// Example Usage in Browser Console:
/*
// 1. Check backend
await checkBackendHealth();

// 2. Create a scene
const sceneId = await createSimpleScene();

// 3. Generate links
generateShareableLinks(sceneId);

// 4. List all scenes
await listAllScenes();

// 5. Get stats
await getSceneStats(sceneId);

// 6. Modify scene
await loadAndModifyScene(sceneId);
*/

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSimpleScene,
    loadAndModifyScene,
    listAllScenes,
    createImageTrackingScene,
    generateShareableLinks,
    uploadModelAsset,
    deleteScene,
    checkBackendHealth,
    batchCreateScenes,
    getSceneStats
  };
}
