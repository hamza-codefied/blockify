import { useState, useEffect, useRef } from 'react'

export const useLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        
        if (isVisible && !hasTriggered) {
          setIsIntersecting(true)
          if (triggerOnce) {
            setHasTriggered(true)
            observer.unobserve(element)
          }
        } else if (!triggerOnce && !isVisible) {
          setIsIntersecting(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return [elementRef, isIntersecting]
}

export const usePreload = (urls) => {
  useEffect(() => {
    if (!Array.isArray(urls)) return

    urls.forEach(url => {
      if (typeof url === 'string') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = url
        link.as = url.endsWith('.css') ? 'style' : 'script'
        document.head.appendChild(link)
      }
    })
  }, [urls])
}

export const useResourcePreload = (resources) => {
  useEffect(() => {
    if (!Array.isArray(resources)) return

    resources.forEach(resource => {
      if (resource.type === 'image') {
        const img = new Image()
        img.src = resource.url
      } else if (resource.type === 'script') {
        const script = document.createElement('script')
        script.src = resource.url
        script.async = true
        document.head.appendChild(script)
      } else if (resource.type === 'style') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource.url
        link.as = 'style'
        document.head.appendChild(link)
      }
    })
  }, [resources])
}
