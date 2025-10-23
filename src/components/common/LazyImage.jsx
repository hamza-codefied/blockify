import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.jpg',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  useEffect(() => {
    if (inView) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
      }
      img.src = src
    }
  }, [inView, src])

  return (
    <div ref={imageRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageSrc === placeholder ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'
        }`}
        style={{
          backgroundImage: `url(${blurDataURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        {...props}
      />
    </div>
  )
}
