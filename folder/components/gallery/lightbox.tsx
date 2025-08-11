'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, ChevronLeft, ChevronRight, ShoppingCart, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageData {
  id: string
  filename: string
  originalUrl: string
  thumbnailUrl: string
  price: number
  selected: boolean
  width?: number
  height?: number
}

interface LightboxProps {
  images: ImageData[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onImageSelect?: (imageId: string, selected: boolean) => void
  selectedImages?: string[]
  watermarkText?: string
  isClient?: boolean
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onImageSelect,
  selectedImages = [],
  watermarkText = "",
  isClient = false
}: LightboxProps) {
  const [index, setIndex] = useState(currentIndex)

  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

  const currentImage = images[index]
  if (!currentImage) return null

  const goToPrevious = () => {
    setIndex(index > 0 ? index - 1 : images.length - 1)
  }

  const goToNext = () => {
    setIndex(index < images.length - 1 ? index + 1 : 0)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, index])

  const toggleSelection = () => {
    if (onImageSelect) {
      const isSelected = selectedImages.includes(currentImage.id)
      onImageSelect(currentImage.id, !isSelected)
    }
  }

  const isSelected = selectedImages.includes(currentImage.id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Main image */}
          <div className="relative max-w-full max-h-full">
            <Image
              src={currentImage.originalUrl}
              alt={currentImage.filename}
              width={currentImage.width || 1200}
              height={currentImage.height || 800}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Watermark for client view */}
            {isClient && watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white/30 text-4xl font-bold transform rotate-12 select-none">
                  {watermarkText}
                </div>
              </div>
            )}
          </div>

          {/* Image info and controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium">{currentImage.filename}</h3>
                <p className="text-sm text-white/70">
                  {index + 1} of {images.length}
                  {currentImage.width && currentImage.height && 
                    ` • ${currentImage.width}×${currentImage.height}`
                  }
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/90 text-black">
                ${currentImage.price.toFixed(2)}
              </Badge>
            </div>

            {/* Client controls */}
            {isClient && onImageSelect && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={isSelected ? "default" : "secondary"}
                  onClick={toggleSelection}
                  className={cn(
                    "transition-colors",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isSelected ? "Remove from Cart" : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>

          {/* Image counter dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === index ? "bg-white" : "bg-white/30"
                  )}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}