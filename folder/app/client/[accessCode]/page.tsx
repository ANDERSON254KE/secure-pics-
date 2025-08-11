'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ImageGrid } from '@/components/gallery/image-grid'
import { Lightbox } from '@/components/gallery/lightbox'
import { ShoppingCart, Eye, Download, Share2, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface Gallery {
  id: string
  name: string
  description?: string
  clientName: string
  clientEmail: string
  accessCode: string
  isActive: boolean
  expiresAt?: string
  photographer: {
    name: string
    email: string
  }
  images: ImageData[]
}

interface CartItem {
  imageId: string
  image: ImageData
  quantity: number
}

export default function ClientGalleryPage({ params }: { params: { accessCode: string } }) {
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    fetchGallery()
  }, [params.accessCode])

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/client/gallery/${params.accessCode}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data)
        
        // Track view
        await fetch(`/api/client/gallery/${params.accessCode}/view`, {
          method: 'POST'
        })
      } else if (response.status === 404) {
        setError('Gallery not found or has expired')
      } else {
        setError('Failed to load gallery')
      }
    } catch (error) {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (imageId: string, selected: boolean) => {
    if (selected) {
      setSelectedImages(prev => [...prev, imageId])
      // Add to cart
      const image = gallery?.images.find(img => img.id === imageId)
      if (image) {
        setCart(prev => {
          const existing = prev.find(item => item.imageId === imageId)
          if (existing) {
            return prev.map(item => 
              item.imageId === imageId 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
          return [...prev, { imageId, image, quantity: 1 }]
        })
      }
    } else {
      setSelectedImages(prev => prev.filter(id => id !== imageId))
      // Remove from cart
      setCart(prev => prev.filter(item => item.imageId !== imageId))
    }
  }

  const handleImageView = (image: ImageData) => {
    if (!gallery) return
    const index = gallery.images.findIndex(img => img.id === image.id)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const updateCartQuantity = (imageId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(imageId)
      return
    }
    
    setCart(prev => prev.map(item => 
      item.imageId === imageId 
        ? { ...item, quantity }
        : item
    ))
  }

  const removeFromCart = (imageId: string) => {
    setCart(prev => prev.filter(item => item.imageId !== imageId))
    setSelectedImages(prev => prev.filter(id => id !== imageId))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.image.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          galleryId: gallery?.id,
          items: cart.map(item => ({
            imageId: item.imageId,
            quantity: item.quantity,
            price: item.image.price
          })),
          clientEmail: gallery?.clientEmail,
          clientName: gallery?.clientName
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (error) {
      toast.error('An error occurred during checkout')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Gallery Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'The gallery you are looking for does not exist or has expired.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gallery.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Gallery Inactive</h1>
            <p className="text-muted-foreground mb-4">
              This gallery is currently inactive. Please contact the photographer for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{gallery.name}</h1>
              <p className="text-slate-300 mt-1">
                by {gallery.photographer.name} • {gallery.images.length} images
              </p>
              {gallery.description && (
                <p className="text-slate-400 mt-2">{gallery.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCart(!showCart)}
                variant="outline"
                className="text-white border-white hover:bg-white/10 relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.length})
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Gallery */}
          <div className="lg:col-span-3">
            {gallery.images.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <Eye className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Images Yet</h3>
                  <p className="text-slate-300">
                    The photographer hasn't uploaded any images to this gallery yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ImageGrid
                images={gallery.images}
                isClient={true}
                onImageSelect={handleImageSelect}
                onImageView={handleImageView}
                selectedImages={selectedImages}
                watermarkText={gallery.photographer.name}
              />
            )}
          </div>

          {/* Shopping Cart Sidebar */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shopping Cart
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} selected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.imageId} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                            <div className="relative w-16 h-16 rounded overflow-hidden">
                              <Image
                                src={item.image.thumbnailUrl}
                                alt={item.image.filename}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {item.image.filename}
                              </p>
                              <p className="text-slate-300 text-sm">
                                ${item.image.price.toFixed(2)} each
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 text-white border-white/20"
                                  onClick={() => updateCartQuantity(item.imageId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-white text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 text-white border-white/20"
                                  onClick={() => updateCartQuantity(item.imageId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 text-red-400 border-red-400/20 hover:bg-red-400/10"
                                  onClick={() => removeFromCart(item.imageId)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-300">
                          <span>Subtotal:</span>
                          <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total:</span>
                          <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCheckout}
                        className="w-full bg-white text-slate-900 hover:bg-white/90"
                        disabled={cart.length === 0}
                      >
                        Proceed to Checkout
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {gallery.images.length > 0 && (
        <Lightbox
          images={gallery.images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onImageSelect={handleImageSelect}
          selectedImages={selectedImages}
          watermarkText={gallery.photographer.name}
          isClient={true}
        />
      )}
    </div>
  )
}