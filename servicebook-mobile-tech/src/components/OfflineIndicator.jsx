/**
 * Offline Indicator Component for ServiceBook Pros Mobile App
 * Shows connection status and sync information
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';

const OfflineIndicator = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingItems: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const status = offlineManager.getConnectionStatus();
      setConnectionStatus(status);
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      updateStatus();
      setSyncing(true);
      setTimeout(() => setSyncing(false), 2000);
    };
    
    const handleOffline = () => {
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!connectionStatus.isOnline) return;
    
    setSyncing(true);
    try {
      await offlineManager.syncPendingData();
      const status = offlineManager.getConnectionStatus();
      setConnectionStatus(status);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (lastSyncTime) => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMs = now - syncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (!connectionStatus.isOnline) return 'bg-red-500';
    if (connectionStatus.pendingItems > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!connectionStatus.isOnline) return 'Offline';
    if (syncing) return 'Syncing...';
    if (connectionStatus.pendingItems > 0) return `${connectionStatus.pendingItems} pending`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (syncing) return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (!connectionStatus.isOnline) return <WifiOff className="w-3 h-3" />;
    if (connectionStatus.pendingItems > 0) return <Clock className="w-3 h-3" />;
    return <Wifi className="w-3 h-3" />;
  };

  return (
    <>
      {/* Status Indicator */}
      <div 
        className="fixed top-4 right-4 z-40 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="fixed top-12 right-4 z-50 bg-white rounded-lg shadow-xl border max-w-xs w-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Connection Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Connection Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <div className="flex items-center space-x-1">
                  {connectionStatus.isOnline ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-900">
                  {formatLastSync(connectionStatus.lastSyncTime)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Items:</span>
                <span className={`text-sm font-medium ${
                  connectionStatus.pendingItems > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {connectionStatus.pendingItems}
                </span>
              </div>
            </div>

            {/* Sync Button */}
            {connectionStatus.isOnline && (
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}

            {/* Offline Message */}
            {!connectionStatus.isOnline && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Working Offline</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Your data will sync automatically when connection is restored.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Items Warning */}
            {connectionStatus.isOnline && connectionStatus.pendingItems > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Sync in Progress</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {connectionStatus.pendingItems} items waiting to sync with server.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;

