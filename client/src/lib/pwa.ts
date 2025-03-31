export const initPWA = () => {
  // Check if the app is already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    // If the app is launched in standalone mode (installed)
    console.log('Application is running in standalone mode (installed)');
    
    // You can add specific behavior for installed PWA instances here
    // For example, sync data from IndexedDB to server when online
  }
  
  // Handle offline events
  window.addEventListener('offline', () => {
    console.log('App is offline');
    // Update UI to show offline status
    document.dispatchEvent(new CustomEvent('connection-status-change', { detail: { online: false } }));
  });
  
  window.addEventListener('online', () => {
    console.log('App is online');
    // Update UI to show online status
    document.dispatchEvent(new CustomEvent('connection-status-change', { detail: { online: true } }));
    
    // You could trigger sync here
    document.dispatchEvent(new CustomEvent('sync-data'));
  });
  
  // Initial connection status check
  if (!navigator.onLine) {
    document.dispatchEvent(new CustomEvent('connection-status-change', { detail: { online: false } }));
  }
};
