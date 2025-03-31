// Cache names
const CACHE_NAME = 'fintrack-v1';
const DATA_CACHE_NAME = 'fintrack-data-v1';

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/fintrack-logo.svg',
  '/manifest.json'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch event - Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // For API requests, try the network first, then fall back to cached data
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            // If the network request failed, try to get it from the cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // For non-API requests, use a "Network first, falling back to cache" strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If the request is for a page, show the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Otherwise return a generic error
            return new Response('', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Function to sync transactions when coming back online
async function syncTransactions() {
  // This would typically sync IndexedDB data with a backend
  // For now, we just log that a sync would happen
  console.log('Background sync would happen here');
  
  // Send a message to all clients that sync is complete
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETED'
    });
  });
}
