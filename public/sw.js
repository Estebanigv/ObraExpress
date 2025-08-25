// Service Worker para ObraExpress Chile
const CACHE_NAME = 'obraexpress-v1.0.0';
const CACHE_ASSETS = [
  '/',
  '/productos',
  '/nosotros',
  '/contacto',
  '/manifest.json',
  '/assets/images/Logotipo/isotipo_obraexpress.webp',
  '/assets/images/bannerB-q82.webp'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(CACHE_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache assets:', error);
      })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[SW] Clearing old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
  );
});

// Fetch Event - Cache First Strategy for static assets, Network First for API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extensions and dev tools
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') return;
  
  // API calls - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for cache
          const responseClone = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static assets - Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response for cache
            const responseClone = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cache static assets
                if (
                  url.pathname.includes('/assets/') ||
                  url.pathname.includes('/_next/static/') ||
                  url.pathname.endsWith('.webp') ||
                  url.pathname.endsWith('.jpg') ||
                  url.pathname.endsWith('.png') ||
                  url.pathname.endsWith('.svg') ||
                  url.pathname.endsWith('.css') ||
                  url.pathname.endsWith('.js')
                ) {
                  cache.put(request, responseClone);
                }
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html lang="es-CL">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión - ObraExpress Chile</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background-color: #f8fafc;
                      color: #374151;
                    }
                    .offline-container {
                      text-align: center;
                      padding: 2rem;
                      max-width: 400px;
                    }
                    .logo {
                      font-size: 3rem;
                      margin-bottom: 1rem;
                    }
                    .title {
                      font-size: 1.5rem;
                      font-weight: 600;
                      margin-bottom: 1rem;
                      color: #1f2937;
                    }
                    .message {
                      margin-bottom: 2rem;
                      color: #6b7280;
                    }
                    .retry-btn {
                      background-color: #3b82f6;
                      color: white;
                      border: none;
                      padding: 0.75rem 1.5rem;
                      border-radius: 0.5rem;
                      cursor: pointer;
                      font-size: 1rem;
                      transition: background-color 0.2s;
                    }
                    .retry-btn:hover {
                      background-color: #2563eb;
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <div class="logo">🏗️</div>
                    <h1 class="title">Sin conexión a internet</h1>
                    <p class="message">
                      No se pudo conectar con ObraExpress Chile. 
                      Verifica tu conexión e intenta nuevamente.
                    </p>
                    <button class="retry-btn" onclick="window.location.reload()">
                      Intentar de nuevo
                    </button>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            
            throw error;
          });
      })
  );
});

// Background Sync for form submissions (if supported)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

// Function to sync pending contact forms
async function syncContactForms() {
  try {
    // Get pending forms from IndexedDB or localStorage
    const pendingForms = await getPendingForms();
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form.data)
        });
        
        if (response.ok) {
          // Remove from pending forms
          await removePendingForm(form.id);
          console.log('[SW] Contact form synced successfully');
        }
      } catch (error) {
        console.error('[SW] Failed to sync contact form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper functions for form sync
async function getPendingForms() {
  // Implementation would use IndexedDB or localStorage
  return [];
}

async function removePendingForm(id) {
  // Implementation would remove from IndexedDB or localStorage
  console.log('[SW] Removing pending form:', id);
}

// Push notification handler (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nuevas ofertas en ObraExpress Chile',
    icon: '/assets/images/Logotipo/isotipo_obraexpress.webp',
    badge: '/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver ofertas',
        icon: '/assets/images/icons/explore.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/images/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ObraExpress Chile', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/productos')
    );
  }
});

console.log('[SW] Service Worker loaded');