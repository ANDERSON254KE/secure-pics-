'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, ShoppingCart, Download } from 'lucide-react'
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

interface ImageGridProps {
  images: ImageData[]
  isClient?: boolean
  onImageSelect?: (imageId: string, selected: boolean) => void
  onImageView?: (image: ImageData) => void
  selectedImages?: string[]
  watermarkText?: string
}

export function ImageGrid({ 
  images, 
  isClient = false, 
  onImageSelect,
  onImageView,
  selectedImages = [],
  watermarkText = ""
}: ImageGridProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const handleImageClick = (image: ImageData) => {
    if (onImageView) {
      onImageView(image)
    }
  }

  const handleSelectionChange = (imageId: string, checked: boolean) => {
    if (onImageSelect) {
      onImageSelect(imageId, checked)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image) => (
        <Card 
          key={image.id} 
          className="group overflow-hidden cursor-pointer transition-all hover:shadow-lg"
          onMouseEnter={() => setHoveredImage(image.id)}
          onMouseLeave={() => setHoveredImage(null)}
        >
          <CardContent className="p-0 relative">
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={image.thumbnailUrl}
                alt={image.filename}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                onClick={() => handleImageClick(image)}
              />

              {/* Watermark overlay for client view */}
              {isClient && watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-white/50 text-lg font-bold transform rotate-12 select-none">
                    {watermarkText}
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              {hoveredImage === image.id && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleImageClick(image)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              )}

              {/* Selection checkbox for client view */}
              {isClient && (
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedImages.includes(image.id)}
                    onCheckedChange={(checked) => 
                      handleSelectionChange(image.id, checked as boolean)
                    }
                    className="bg-white/90 border-2"
                  />
                </div>
              )}

              {/* Price badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  ${image.price.toFixed(2)}
                </Badge>
              </div>

              {/* Selection indicator */}
              {selectedImages.includes(image.id) && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary">
                  <div className="absolute top-2 left-2">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <ShoppingCart className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image info */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground truncate">
                {image.filename}
              </p>
              {image.width && image.height && (
                <p className="text-xs text-muted-foreground">
                  {image.width} × {image.height}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}