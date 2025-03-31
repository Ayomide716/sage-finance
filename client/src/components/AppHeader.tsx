import { useState } from 'react';
import { useLocation } from 'wouter';

interface AppHeaderProps {}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const [, setLocation] = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for online/offline events
  useState(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const syncData = () => {
    // This would sync data with a backend if we had one
    // For now, just show an indicator that the data is synced
    const toast = document.createEvent('CustomEvent');
    toast.initCustomEvent('toast', true, true, {
      message: isOffline 
        ? 'You are offline. Data will be synced when you reconnect.' 
        : 'Data synced successfully!',
      type: isOffline ? 'warning' : 'success'
    });
    document.dispatchEvent(toast);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <h1 className="text-xl font-semibold text-dark" onClick={() => setLocation('/')}>FinTrack</h1>
        </div>
        <div className="flex items-center">
          <button 
            onClick={syncData} 
            className="p-2 text-textGray relative"
            aria-label="Sync data"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isOffline && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-warning rounded-full"></span>
            )}
          </button>
          <button 
            className="ml-2 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white"
            aria-label="Profile menu"
          >
            <span className="text-xs">JS</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
