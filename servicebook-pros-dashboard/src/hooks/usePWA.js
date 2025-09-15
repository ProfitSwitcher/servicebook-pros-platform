import { useState, useEffect } from 'react'

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true)
      }
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          })

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_COMPLETE') {
              console.log('ServiceBook Pros: Offline data synced')
              // You can show a notification to the user here
            }
          })

          console.log('ServiceBook Pros: Service Worker registered successfully')
        } catch (error) {
          console.error('ServiceBook Pros: Service Worker registration failed:', error)
        }
      }
    }

    // Initialize
    checkIfInstalled()
    registerServiceWorker()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install the PWA
  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('ServiceBook Pros: PWA installation failed:', error)
      return false
    }
  }

  // Update the service worker
  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Show local notification
  const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    }
    return null
  }

  // Store data for offline sync
  const storeOfflineData = (data) => {
    try {
      const offlineData = JSON.parse(localStorage.getItem('servicebook-offline-data') || '[]')
      offlineData.push({
        ...data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      })
      localStorage.setItem('servicebook-offline-data', JSON.stringify(offlineData))
      return true
    } catch (error) {
      console.error('ServiceBook Pros: Failed to store offline data:', error)
      return false
    }
  }

  // Get offline data
  const getOfflineData = () => {
    try {
      return JSON.parse(localStorage.getItem('servicebook-offline-data') || '[]')
    } catch (error) {
      console.error('ServiceBook Pros: Failed to get offline data:', error)
      return []
    }
  }

  // Clear offline data
  const clearOfflineData = () => {
    try {
      localStorage.removeItem('servicebook-offline-data')
      return true
    } catch (error) {
      console.error('ServiceBook Pros: Failed to clear offline data:', error)
      return false
    }
  }

  // Check if device supports PWA features
  const getPWACapabilities = () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
      installPrompt: 'BeforeInstallPromptEvent' in window || deferredPrompt !== null,
      standalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    }
  }

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    
    // Actions
    installPWA,
    updateServiceWorker,
    requestNotificationPermission,
    showNotification,
    
    // Offline functionality
    storeOfflineData,
    getOfflineData,
    clearOfflineData,
    
    // Capabilities
    capabilities: getPWACapabilities()
  }
}

export default usePWA

