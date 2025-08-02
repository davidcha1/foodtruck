'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from './badge'

interface ImageCarouselProps {
  images: string[]
  title: string
  className?: string
  height?: string
  showDots?: boolean
  showCounter?: boolean
  showArrows?: boolean
  enableKeyboard?: boolean
}

export function ImageCarousel({
  images,
  title,
  className = '',
  height = 'h-48',
  showDots = true,
  showCounter = true,
  showArrows = true,
  enableKeyboard = false
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard || images.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, enableKeyboard])

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 ${height} rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-sm">No images available</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${height} rounded-lg overflow-hidden ${className}`}>
      <img
        src={images[currentIndex]}
        alt={`${title} view ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
      
      {/* Image Counter */}
      {showCounter && images.length > 1 && (
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-black/50 text-white text-xs">
            {currentIndex + 1} of {images.length}
          </Badge>
        </div>
      )}
      
      {/* Dot Indicators */}
      {showDots && images.length > 1 && images.length <= 8 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 