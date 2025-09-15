/**
 * PWA Installer Component for ServiceBook Pros Mobile App
 * Handles app installation prompts and PWA features
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installationStep, setInstallationStep] = useState(0);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallationStep(1);
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallationStep(2);
        setTimeout(() => {
          setShowInstallPrompt(false);
          setInstallationStep(0);
        }, 2000);
      } else {
        setInstallationStep(0);
        setShowInstallPrompt(false);
        // Remember that user dismissed the prompt
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      setInstallationStep(0);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return {
        icon: <Smartphone className="w-6 h-6" />,
        title: "Install on iOS",
        steps: [
          "Tap the Share button in Safari",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to install the app"
        ]
      };
    } else if (isAndroid) {
      return {
        icon: <Smartphone className="w-6 h-6" />,
        title: "Install on Android",
        steps: [
          "Tap the menu button (⋮) in Chrome",
          "Select 'Add to Home screen'",
          "Tap 'Add' to install the app"
        ]
      };
    } else {
      return {
        icon: <Monitor className="w-6 h-6" />,
        title: "Install on Desktop",
        steps: [
          "Click the install button in your browser's address bar",
          "Or use the button below to install",
          "The app will be added to your applications"
        ]
      };
    }
  };

  if (isInstalled) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">App Installed!</span>
        </div>
      </div>
    );
  }

  if (!showInstallPrompt) {
    return (
      <>
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-40">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Manual Install Button */}
        {deferredPrompt && (
          <button
            onClick={() => setShowInstallPrompt(true)}
            className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Install App"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </>
    );
  }

  const instructions = getInstallInstructions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {instructions.icon}
            <h3 className="text-lg font-semibold text-gray-900">
              Install ServiceBook Pros
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {installationStep === 0 && (
            <>
              <p className="text-gray-600 mb-4">
                Install the ServiceBook Pros app for the best mobile experience with offline capabilities.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">App Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Work offline when internet is unavailable</li>
                  <li>• Faster loading and better performance</li>
                  <li>• Push notifications for job updates</li>
                  <li>• Native app-like experience</li>
                  <li>• Automatic data sync when online</li>
                </ul>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Install App</span>
                </button>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{instructions.title}:</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}

          {installationStep === 1 && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Installing app...</p>
            </div>
          )}

          {installationStep === 2 && (
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">App installed successfully!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {installationStep === 0 && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;

