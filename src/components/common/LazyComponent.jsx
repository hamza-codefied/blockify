import React, { Suspense, lazy } from 'react'
import { useInView } from 'react-intersection-observer'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
)

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, _errorInfo) {
    console.error('LazyComponent Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 text-red-600">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm">Failed to load component</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const LazyComponent = ({ 
  importFunc, 
  fallback = <LoadingSpinner />,
  threshold = 0.1,
  triggerOnce = true,
  ...props 
}) => {
  const [imageRef, inView] = useInView({
    triggerOnce,
    threshold
  })

  const LazyLoadedComponent = lazy(importFunc)

  return (
    <div ref={imageRef}>
      {inView ? (
        <ErrorBoundary>
          <Suspense fallback={fallback}>
            <LazyLoadedComponent {...props} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <div className="min-h-[200px] flex items-center justify-center">
          {fallback}
        </div>
      )}
    </div>
  )
}
