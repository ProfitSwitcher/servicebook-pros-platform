/**
 * Offline Manager for ServiceBook Pros Mobile App
 * Handles offline data storage, sync, and queue management
 */

class OfflineManager {
  constructor() {
    this.dbName = 'ServiceBookProsOffline';
    this.dbVersion = 1;
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
    
    this.init();
    this.setupEventListeners();
  }

  async init() {
    try {
      await this.initIndexedDB();
      await this.loadSyncQueue();
      
      if (this.isOnline) {
        await this.syncPendingData();
      }
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
    }
  }

  initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for offline data
        if (!db.objectStoreNames.contains('jobs')) {
          const jobStore = db.createObjectStore('jobs', { keyPath: 'id' });
          jobStore.createIndex('status', 'status', { unique: false });
          jobStore.createIndex('technician_id', 'technician_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('materials')) {
          db.createObjectStore('materials', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('time_entries')) {
          const timeStore = db.createObjectStore('time_entries', { keyPath: 'id', autoIncrement: true });
          timeStore.createIndex('job_id', 'job_id', { unique: false });
          timeStore.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('job_id', 'job_id', { unique: false });
          photoStore.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  // Data Storage Methods
  async storeJob(job) {
    return this.storeData('jobs', job);
  }

  async storeCustomer(customer) {
    return this.storeData('customers', customer);
  }

  async storeMaterial(material) {
    return this.storeData('materials', material);
  }

  async storeTimeEntry(timeEntry) {
    timeEntry.synced = false;
    timeEntry.created_offline = true;
    timeEntry.timestamp = new Date().toISOString();
    return this.storeData('time_entries', timeEntry);
  }

  async storePhoto(photo) {
    photo.synced = false;
    photo.created_offline = true;
    photo.timestamp = new Date().toISOString();
    return this.storeData('photos', photo);
  }

  async storeData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Data Retrieval Methods
  async getJobs(technicianId = null) {
    const jobs = await this.getData('jobs');
    if (technicianId) {
      return jobs.filter(job => job.technician_id === technicianId);
    }
    return jobs;
  }

  async getCustomers() {
    return this.getData('customers');
  }

  async getMaterials() {
    return this.getData('materials');
  }

  async getTimeEntries(jobId = null) {
    const entries = await this.getData('time_entries');
    if (jobId) {
      return entries.filter(entry => entry.job_id === jobId);
    }
    return entries;
  }

  async getPhotos(jobId = null) {
    const photos = await this.getData('photos');
    if (jobId) {
      return photos.filter(photo => photo.job_id === jobId);
    }
    return photos;
  }

  async getData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Management
  async addToSyncQueue(action, data) {
    const queueItem = {
      action,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(queueItem);
      
      request.onsuccess = () => {
        this.syncQueue.push({ ...queueItem, id: request.result });
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async loadSyncQueue() {
    this.syncQueue = await this.getData('sync_queue');
  }

  async syncPendingData() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    console.log(`Syncing ${this.syncQueue.length} pending items...`);
    
    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
        await this.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
        item.attempts++;
        
        if (item.attempts >= item.maxAttempts) {
          console.error('Max sync attempts reached for item:', item);
          await this.removeFromSyncQueue(item.id);
        }
      }
    }
    
    // Update last sync time
    this.lastSyncTime = new Date().toISOString();
    localStorage.setItem('lastSyncTime', this.lastSyncTime);
  }

  async syncItem(item) {
    const { action, data } = item;
    
    switch (action) {
      case 'CREATE_TIME_ENTRY':
        await this.syncTimeEntry(data);
        break;
      case 'UPLOAD_PHOTO':
        await this.syncPhoto(data);
        break;
      case 'UPDATE_JOB_STATUS':
        await this.syncJobStatus(data);
        break;
      case 'CREATE_MATERIAL_REQUEST':
        await this.syncMaterialRequest(data);
        break;
      case 'UPDATE_CUSTOMER_NOTES':
        await this.syncCustomerNotes(data);
        break;
      default:
        console.warn('Unknown sync action:', action);
    }
  }

  async syncTimeEntry(timeEntry) {
    const response = await fetch('/api/time-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(timeEntry)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync time entry');
    }
    
    // Mark as synced in local storage
    timeEntry.synced = true;
    await this.storeTimeEntry(timeEntry);
  }

  async syncPhoto(photo) {
    const formData = new FormData();
    formData.append('photo', photo.file);
    formData.append('job_id', photo.job_id);
    formData.append('category', photo.category);
    formData.append('description', photo.description);
    
    const response = await fetch('/api/photos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync photo');
    }
    
    // Mark as synced in local storage
    photo.synced = true;
    await this.storePhoto(photo);
  }

  async syncJobStatus(jobUpdate) {
    const response = await fetch(`/api/jobs/${jobUpdate.job_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(jobUpdate)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync job status');
    }
  }

  async syncMaterialRequest(materialRequest) {
    const response = await fetch('/api/materials/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(materialRequest)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync material request');
    }
  }

  async syncCustomerNotes(customerUpdate) {
    const response = await fetch(`/api/customers/${customerUpdate.customer_id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(customerUpdate)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync customer notes');
    }
  }

  async removeFromSyncQueue(itemId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(itemId);
      
      request.onsuccess = () => {
        this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Offline Actions
  async clockIn(technicianId, location = null) {
    const timeEntry = {
      technician_id: technicianId,
      action: 'clock_in',
      timestamp: new Date().toISOString(),
      location: location
    };
    
    await this.storeTimeEntry(timeEntry);
    
    if (this.isOnline) {
      await this.addToSyncQueue('CREATE_TIME_ENTRY', timeEntry);
    }
    
    return timeEntry;
  }

  async clockOut(technicianId, location = null) {
    const timeEntry = {
      technician_id: technicianId,
      action: 'clock_out',
      timestamp: new Date().toISOString(),
      location: location
    };
    
    await this.storeTimeEntry(timeEntry);
    
    if (this.isOnline) {
      await this.addToSyncQueue('CREATE_TIME_ENTRY', timeEntry);
    }
    
    return timeEntry;
  }

  async startJob(jobId, technicianId) {
    const timeEntry = {
      job_id: jobId,
      technician_id: technicianId,
      action: 'start_job',
      timestamp: new Date().toISOString()
    };
    
    await this.storeTimeEntry(timeEntry);
    
    if (this.isOnline) {
      await this.addToSyncQueue('CREATE_TIME_ENTRY', timeEntry);
      await this.addToSyncQueue('UPDATE_JOB_STATUS', {
        job_id: jobId,
        status: 'in_progress',
        started_at: timeEntry.timestamp
      });
    }
    
    return timeEntry;
  }

  async completeJob(jobId, technicianId, notes = '') {
    const timeEntry = {
      job_id: jobId,
      technician_id: technicianId,
      action: 'complete_job',
      timestamp: new Date().toISOString(),
      notes: notes
    };
    
    await this.storeTimeEntry(timeEntry);
    
    if (this.isOnline) {
      await this.addToSyncQueue('CREATE_TIME_ENTRY', timeEntry);
      await this.addToSyncQueue('UPDATE_JOB_STATUS', {
        job_id: jobId,
        status: 'completed',
        completed_at: timeEntry.timestamp,
        completion_notes: notes
      });
    }
    
    return timeEntry;
  }

  async capturePhoto(jobId, file, category, description) {
    const photo = {
      job_id: jobId,
      file: file,
      category: category,
      description: description,
      timestamp: new Date().toISOString()
    };
    
    await this.storePhoto(photo);
    
    if (this.isOnline) {
      await this.addToSyncQueue('UPLOAD_PHOTO', photo);
    }
    
    return photo;
  }

  async requestMaterials(jobId, materials, priority = 'normal') {
    const materialRequest = {
      job_id: jobId,
      materials: materials,
      priority: priority,
      requested_at: new Date().toISOString(),
      status: 'pending'
    };
    
    if (this.isOnline) {
      await this.addToSyncQueue('CREATE_MATERIAL_REQUEST', materialRequest);
    }
    
    return materialRequest;
  }

  // Utility Methods
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingItems: this.syncQueue.length
    };
  }

  async clearOfflineData() {
    const stores = ['jobs', 'customers', 'materials', 'time_entries', 'photos', 'sync_queue'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    this.syncQueue = [];
    localStorage.removeItem('lastSyncTime');
  }

  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

