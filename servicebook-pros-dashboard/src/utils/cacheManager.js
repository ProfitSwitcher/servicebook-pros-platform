// Cache Manager for ServiceBook Pros
// Implements intelligent caching strategies for API responses and assets

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default
    this.maxCacheSize = 100 // Maximum number of cached items
  }

  // Set cache with TTL (Time To Live)
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.delete(oldestKey)
    }

    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + ttl)
    
    // Auto-cleanup expired items
    setTimeout(() => {
      if (this.isExpired(key)) {
        this.delete(key)
      }
    }, ttl)
  }

  // Get cached value
  get(key) {
    if (this.isExpired(key)) {
      this.delete(key)
      return null
    }
    return this.cache.get(key) || null
  }

  // Check if cache key exists and is valid
  has(key) {
    if (this.isExpired(key)) {
      this.delete(key)
      return false
    }
    return this.cache.has(key)
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }

  // Check if cache entry is expired
  isExpired(key) {
    const expiry = this.cacheExpiry.get(key)
    return expiry && Date.now() > expiry
  }

  // Clear all cache
  clear() {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys())
    }
  }

  // Cache with different TTL strategies
  setShortTerm(key, value) {
    this.set(key, value, 1 * 60 * 1000) // 1 minute
  }

  setMediumTerm(key, value) {
    this.set(key, value, 5 * 60 * 1000) // 5 minutes
  }

  setLongTerm(key, value) {
    this.set(key, value, 30 * 60 * 1000) // 30 minutes
  }

  // Cache API responses with intelligent key generation
  cacheApiResponse(endpoint, params, response, ttl) {
    const cacheKey = this.generateApiCacheKey(endpoint, params)
    this.set(cacheKey, response, ttl)
  }

  getCachedApiResponse(endpoint, params) {
    const cacheKey = this.generateApiCacheKey(endpoint, params)
    return this.get(cacheKey)
  }

  generateApiCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `api:${endpoint}:${JSON.stringify(sortedParams)}`
  }
}

// Create singleton instance
const cacheManager = new CacheManager()

// Enhanced API client with caching
export const createCachedApiCall = (apiFunction, cacheKey, ttl) => {
  return async (...args) => {
    const fullCacheKey = `${cacheKey}:${JSON.stringify(args)}`
    
    // Check cache first
    const cached = cacheManager.get(fullCacheKey)
    if (cached) {
      return cached
    }

    try {
      // Make API call
      const result = await apiFunction(...args)
      
      // Cache successful response
      cacheManager.set(fullCacheKey, result, ttl)
      
      return result
    } catch (error) {
      // Don't cache errors, but could implement error caching if needed
      throw error
    }
  }
}

// Specific cache strategies for different data types
export const CacheStrategies = {
  // User data - cache for 30 minutes
  USER_DATA: 30 * 60 * 1000,
  
  // Customer data - cache for 10 minutes
  CUSTOMER_DATA: 10 * 60 * 1000,
  
  // Job data - cache for 5 minutes (more dynamic)
  JOB_DATA: 5 * 60 * 1000,
  
  // Analytics data - cache for 15 minutes
  ANALYTICS_DATA: 15 * 60 * 1000,
  
  // Settings data - cache for 1 hour
  SETTINGS_DATA: 60 * 60 * 1000,
  
  // Static data (pricing, categories) - cache for 2 hours
  STATIC_DATA: 2 * 60 * 60 * 1000
}

// Browser storage cache for persistence across sessions
export class PersistentCache {
  constructor(storageKey = 'servicebook_cache') {
    this.storageKey = storageKey
    this.storage = localStorage
  }

  set(key, value, ttl = 24 * 60 * 60 * 1000) { // Default 24 hours
    const item = {
      value,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    }
    
    try {
      const cache = this.getCache()
      cache[key] = item
      this.storage.setItem(this.storageKey, JSON.stringify(cache))
    } catch (error) {
      console.warn('Failed to set persistent cache:', error)
    }
  }

  get(key) {
    try {
      const cache = this.getCache()
      const item = cache[key]
      
      if (!item) return null
      
      if (Date.now() > item.expiry) {
        this.delete(key)
        return null
      }
      
      return item.value
    } catch (error) {
      console.warn('Failed to get persistent cache:', error)
      return null
    }
  }

  delete(key) {
    try {
      const cache = this.getCache()
      delete cache[key]
      this.storage.setItem(this.storageKey, JSON.stringify(cache))
    } catch (error) {
      console.warn('Failed to delete persistent cache:', error)
    }
  }

  clear() {
    try {
      this.storage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error)
    }
  }

  getCache() {
    try {
      const cached = this.storage.getItem(this.storageKey)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.warn('Failed to parse persistent cache:', error)
      return {}
    }
  }

  // Clean up expired items
  cleanup() {
    try {
      const cache = this.getCache()
      const now = Date.now()
      let hasChanges = false

      Object.keys(cache).forEach(key => {
        if (cache[key].expiry < now) {
          delete cache[key]
          hasChanges = true
        }
      })

      if (hasChanges) {
        this.storage.setItem(this.storageKey, JSON.stringify(cache))
      }
    } catch (error) {
      console.warn('Failed to cleanup persistent cache:', error)
    }
  }
}

// Create persistent cache instance
export const persistentCache = new PersistentCache()

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  persistentCache.cleanup()
  
  // Cleanup every hour
  setInterval(() => {
    persistentCache.cleanup()
  }, 60 * 60 * 1000)
}

export default cacheManager

