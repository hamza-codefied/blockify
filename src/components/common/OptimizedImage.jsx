import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality: _quality = 75,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder === 'blur' ? blurDataURL : '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    skip: priority
  })

  useEffect(() => {
    if (priority || inView) {
      loadImage()
    }
  }, [priority, inView, loadImage])

  const loadImage = useCallback(() => {
    if (hasError) return

    const img = new Image()
    
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      setHasError(true)
      setIsLoaded(true)
    }
    
    img.src = src
  }, [src, hasError])

  const handleRetry = () => {
    setHasError(false)
    setIsLoaded(false)
    loadImage()
  }

  if (hasError) {
    return (
      <div 
        ref={ref}
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
          <button 
            onClick={handleRetry}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${placeholder === 'blur' && !isLoaded ? 'blur-sm' : ''}`}
        style={{
          backgroundImage: placeholder === 'blur' ? `url(${blurDataURL})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        {...props}
      />
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  )
}
