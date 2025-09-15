import React, { useState } from 'react'
import { Download, X, Smartphone, Monitor, Zap, Wifi, Bell } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installPWA, capabilities } = usePWA()
  const [showPrompt, setShowPrompt] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable || !showPrompt) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await installPWA()
      if (success) {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const features = [
    {
      icon: Smartphone,
      title: 'Mobile App Experience',
      description: 'Works like a native mobile app with full-screen experience'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance on all devices'
    },
    {
      icon: Wifi,
      title: 'Works Offline',
      description: 'Access your data and continue working even without internet'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get notified about new jobs, messages, and important updates'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">SB</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Install ServiceBook Pros
          </h2>
          <p className="text-gray-600">
            Get the full app experience with offline access and notifications
          </p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {isInstalling ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Installing...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Install App</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowPrompt(false)}
            className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Device Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Monitor className="w-4 h-4" />
              <span>
                {capabilities.standalone ? 'Standalone App Mode' : 'Browser Mode'} • 
                {capabilities.serviceWorker ? ' Offline Ready' : ' Online Only'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt

