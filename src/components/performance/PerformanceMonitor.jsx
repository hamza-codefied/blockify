import { useEffect, useState } from 'react'
import { getPerformanceMetrics } from '@utils/performance'

export const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    if (!enabled) return

    const measurePerformance = () => {
      const performanceData = getPerformanceMetrics()
      setMetrics(performanceData)
      
      // Log performance metrics to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚀 Performance Metrics')
        console.log('DOM Content Loaded:', `${performanceData.domContentLoaded.toFixed(2)}ms`)
        console.log('Load Complete:', `${performanceData.loadComplete.toFixed(2)}ms`)
        console.log('Total Load Time:', `${performanceData.totalLoadTime.toFixed(2)}ms`)
        console.log('First Paint:', `${performanceData.firstPaint.toFixed(2)}ms`)
        console.log('First Contentful Paint:', `${performanceData.firstContentfulPaint.toFixed(2)}ms`)
        
        if (performanceData.memory) {
          console.log('Memory Usage:', {
            used: `${(performanceData.memory.used / 1024 / 1024).toFixed(2)}MB`,
            total: `${(performanceData.memory.total / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(performanceData.memory.limit / 1024 / 1024).toFixed(2)}MB`
          })
        }
        console.groupEnd()
      }
    }

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [enabled])

  if (!enabled || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>FCP: {metrics.firstContentfulPaint.toFixed(0)}ms</div>
        <div>LCP: {metrics.loadComplete.toFixed(0)}ms</div>
        <div>TTI: {metrics.totalLoadTime.toFixed(0)}ms</div>
        {metrics.memory && (
          <div>Memory: {(metrics.memory.used / 1024 / 1024).toFixed(1)}MB</div>
        )}
      </div>
    </div>
  )
}
