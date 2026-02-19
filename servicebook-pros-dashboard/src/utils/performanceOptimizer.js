// Performance Optimization Utilities for ServiceBook Pros

// Image optimization and lazy loading
export class ImageOptimizer {
  static createOptimizedImageUrl(originalUrl, width, height, quality = 80) {
    // If using a CDN service like Cloudinary or ImageKit, format the URL
    // For now, return original URL but could be enhanced with actual CDN integration
    return originalUrl;
  }

  static lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Debounce utility for search and input optimization
export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle utility for scroll and resize events
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Virtual scrolling for large lists
export class VirtualScroller {
  constructor(container, itemHeight, renderItem, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.totalItems = totalItems;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.scrollTop = 0;
    
    this.init();
  }

  init() {
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
    this.container.style.position = 'relative';
    
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.left = '0';
    this.viewport.style.right = '0';
    
    this.container.appendChild(this.viewport);
    
    this.container.addEventListener('scroll', throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    }, 16));
    
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);
    
    this.viewport.innerHTML = '';
    this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      this.viewport.appendChild(item);
    }
  }
}

// Memory management utilities
export class MemoryManager {
  static cleanup() {
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc) {
      window.gc();
    }
    
    // Clear unused event listeners
    this.clearEventListeners();
    
    // Clear large objects from memory
    this.clearLargeObjects();
  }

  static clearEventListeners() {
    // Remove event listeners that might cause memory leaks
    const elements = document.querySelectorAll('[data-cleanup]');
    elements.forEach(element => {
      const events = element.dataset.cleanup.split(',');
      events.forEach(event => {
        element.removeEventListener(event.trim(), null);
      });
    });
  }

  static clearLargeObjects() {
    // Clear large cached objects
    if (window.largeDataCache) {
      window.largeDataCache.clear();
    }
  }

  static monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  }
}

// Bundle splitting and code optimization
export class BundleOptimizer {
  static preloadCriticalChunks() {
    // Preload critical chunks that are likely to be needed
    const criticalChunks = [
      'CustomersPage',
      'ComprehensiveDashboard',
      'ScheduleCalendar'
    ];

    criticalChunks.forEach(chunk => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/js/${chunk.toLowerCase()}-[hash].js`;
      document.head.appendChild(link);
    });
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          request: perfData.responseStart - perfData.requestStart,
          response: perfData.responseEnd - perfData.responseStart,
          dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          load: perfData.loadEventEnd - perfData.loadEventStart,
          total: perfData.loadEventEnd - perfData.navigationStart
        };
        
        console.log('Performance Metrics:', metrics);
        
        // Send to analytics if needed
        this.sendMetrics(metrics);
      }, 0);
    });
  }

  static measureComponentRender(componentName, renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    console.log(`${componentName} render time: ${endTime - startTime}ms`);
    
    return result;
  }

  static measureApiCall(apiName, apiFunction) {
    return async (...args) => {
      const startTime = performance.now();
      try {
        const result = await apiFunction(...args);
        const endTime = performance.now();
        console.log(`${apiName} API call time: ${endTime - startTime}ms`);
        return result;
      } catch (error) {
        const endTime = performance.now();
        console.log(`${apiName} API call failed after: ${endTime - startTime}ms`);
        throw error;
      }
    };
  }

  static sendMetrics(metrics) {
    // Send performance metrics to analytics service
    // This could be Google Analytics, custom analytics, etc.
    if (window.gtag) {
      window.gtag('event', 'page_load_performance', {
        custom_parameter: JSON.stringify(metrics)
      });
    }
  }

  static observeWebVitals() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}

// Resource preloading
export class ResourcePreloader {
  static preloadCriticalResources() {
    // Vite handles modulepreload via index.html — no manual preloading needed
  }

  static prefetchNextPageResources(nextPage) {
    // Vite handles chunk splitting — no manual prefetching needed
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  // Start performance monitoring
  PerformanceMonitor.measurePageLoad();
  PerformanceMonitor.observeWebVitals();
  
  // Preload critical resources
  ResourcePreloader.preloadCriticalResources();
  BundleOptimizer.preloadCriticalChunks();
  
  // Initialize image lazy loading
  ImageOptimizer.lazyLoadImages();
  
  // Memory cleanup on page unload
  window.addEventListener('beforeunload', () => {
    MemoryManager.cleanup();
  });
  
  // Periodic memory monitoring in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      MemoryManager.monitorMemoryUsage();
    }, 30000); // Every 30 seconds
  }
}

export default {
  ImageOptimizer,
  debounce,
  throttle,
  VirtualScroller,
  MemoryManager,
  BundleOptimizer,
  PerformanceMonitor,
  ResourcePreloader,
  initializePerformanceOptimizations
};

