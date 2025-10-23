// Image optimization utilities

export const generateImageSrcSet = (baseUrl, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  return widths
    .map(width => `${baseUrl}?w=${width}&q=75 ${width}w`)
    .join(', ')
}

export const generateWebPSrcSet = (baseUrl, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  return widths
    .map(width => `${baseUrl}?w=${width}&q=75&f=webp ${width}w`)
    .join(', ')
}

export const generateBlurDataURL = (width = 10, height = 10) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  // Create a simple gradient as placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export const preloadImages = async (srcs) => {
  try {
    await Promise.all(srcs.map(preloadImage))
    return true
  } catch (error) {
    console.warn('Some images failed to preload:', error)
    return false
  }
}

export const getOptimalImageSize = (containerWidth, devicePixelRatio = 1) => {
  const optimalWidth = Math.ceil(containerWidth * devicePixelRatio)
  
  // Common breakpoints for responsive images
  const breakpoints = [320, 640, 768, 1024, 1280, 1920]
  
  // Find the smallest breakpoint that's larger than optimal width
  const optimalBreakpoint = breakpoints.find(bp => bp >= optimalWidth) || breakpoints[breakpoints.length - 1]
  
  return optimalBreakpoint
}

export const generateResponsiveImageProps = (baseUrl, alt, options = {}) => {
  const {
    widths = [320, 640, 768, 1024, 1280, 1920],
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality = 75,
    format = 'webp'
  } = options

  const srcSet = format === 'webp' 
    ? generateWebPSrcSet(baseUrl, widths)
    : generateImageSrcSet(baseUrl, widths)

  return {
    src: `${baseUrl}?w=${widths[Math.floor(widths.length / 2)]}&q=${quality}`,
    srcSet,
    sizes,
    alt
  }
}

export const createImagePlaceholder = (width, height, color = '#f3f4f6') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
        ${width} × ${height}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export const optimizeImageForWeb = (imageUrl, options = {}) => {
  const {
    width,
    height,
    quality = 75,
    format = 'webp',
    fit = 'cover'
  } = options

  const params = new URLSearchParams()
  
  if (width) params.append('w', width)
  if (height) params.append('h', height)
  params.append('q', quality)
  params.append('f', format)
  params.append('fit', fit)

  return `${imageUrl}?${params.toString()}`
}
