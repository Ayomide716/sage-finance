import { useEffect, useState } from 'react';

interface InstallBannerProps {}

const InstallBanner: React.FC<InstallBannerProps> = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check if the app is already installed
  useEffect(() => {
    // If app is launched in standalone mode (installed), don't show the banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Whether the user confirmed or not, we no longer need the prompt
    setDeferredPrompt(null);
    
    // Hide the banner if user accepted or we can't prompt anymore
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
  };

  const dismissInstall = () => {
    setShowBanner(false);
    // Optionally store in localStorage to not show again for some time
    localStorage.setItem('installBannerDismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className={`install-banner fixed top-0 left-0 right-0 bg-primary text-white z-50 shadow-md ${showBanner ? 'show' : ''}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <p>Install FinTrack for better experience</p>
        </div>
        <div className="flex">
          <button 
            className="bg-white text-primary rounded px-3 py-1 mr-2 text-sm font-medium"
            onClick={handleInstall}
          >
            Install
          </button>
          <button 
            className="text-white"
            onClick={dismissInstall}
            aria-label="Dismiss install banner"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
