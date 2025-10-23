// Performance utility functions

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const requestIdleCallback = (callback, options = {}) => {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options)
  } else {
    return setTimeout(callback, 1)
  }
}

export const cancelIdleCallback = (id) => {
  if (window.cancelIdleCallback) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

export const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

export const getPerformanceMetrics = () => {
  if (!window.performance) return null

  const navigation = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  
  return {
    // Navigation timing
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    
    // Paint timing
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Memory usage (if available)
    memory: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null
  }
}

export const optimizeImages = (images) => {
  return images.map(img => ({
    ...img,
    loading: 'lazy',
    decoding: 'async',
    fetchpriority: img.priority ? 'high' : 'low'
  }))
}

export const preloadCriticalResources = () => {
  const criticalResources = [
    '/src/styles/index.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.endsWith('.css') ? 'style' : 'font'
    if (resource.includes('fonts.googleapis.com')) {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

export const setupServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  }

  return new IntersectionObserver(callback, { ...defaultOptions, ...options })
}

export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}

export const optimizeScroll = (callback, _delay = 16) => {
  let ticking = false
  
  const update = () => {
    callback()
    ticking = false
  }
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(update)
      ticking = true
    }
  }
}
