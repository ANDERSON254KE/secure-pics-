'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { ArrowLeft, Save, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ImageData {
  id: string
  filename: string
  originalUrl: string
  thumbnailUrl: string
  price: number
  uploadedAt: string
}

interface Gallery {
  id: string
  name: string
  clientName: string
  images: ImageData[]
}

export default function PricingPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [prices, setPrices] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchGallery()
  }, [session, status, router, params.id])

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/galleries/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data)
        
        // Initialize prices state
        const initialPrices: { [key: string]: number } = {}
        data.images.forEach((image: ImageData) => {
          initialPrices[image.id] = image.price
        })
        setPrices(initialPrices)
      } else {
        setError('Gallery not found or access denied')
      }
    } catch (error) {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceChange = (imageId: string, price: string) => {
    const numericPrice = parseFloat(price) || 0
    setPrices(prev => ({
      ...prev,
      [imageId]: numericPrice
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/galleries/${params.id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prices }),
      })

      if (response.ok) {
        toast.success('Prices updated successfully')
        await fetchGallery() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update prices')
        toast.error('Failed to update prices')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      toast.error('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const setBulkPrice = (price: number) => {
    if (!gallery) return
    
    const newPrices: { [key: string]: number } = {}
    gallery.images.forEach(image => {
      newPrices[image.id] = price
    })
    setPrices(newPrices)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !gallery) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/gallery/${gallery?.id}/manage`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery Management
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Pricing</h1>
              <p className="text-muted-foreground mt-2">
                Set individual prices for images in "{gallery?.name}"
              </p>
            </div>
            <Badge variant="outline">
              {gallery?.images.length || 0} Images
            </Badge>
          </div>
        </div>

        {/* Bulk Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Bulk Pricing Actions
            </CardTitle>
            <CardDescription>
              Quickly set the same price for all images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setBulkPrice(5)} variant="outline" size="sm">
                Set All to $5
              </Button>
              <Button onClick={() => setBulkPrice(10)} variant="outline" size="sm">
                Set All to $10
              </Button>
              <Button onClick={() => setBulkPrice(15)} variant="outline" size="sm">
                Set All to $15
              </Button>
              <Button onClick={() => setBulkPrice(25)} variant="outline" size="sm">
                Set All to $25
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Images Grid */}
        {gallery?.images.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Images to Price</h3>
              <p className="text-muted-foreground mb-6">
                Upload some images first before setting prices.
              </p>
              <Link href={`/gallery/${gallery?.id}/upload`}>
                <Button>Upload Images</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery?.images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={image.thumbnailUrl}
                      alt={image.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm truncate">{image.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`price-${image.id}`} className="text-sm">
                          Price (USD)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={`price-${image.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={prices[image.id] || 0}
                            onChange={(e) => handlePriceChange(image.id, e.target.value)}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Prices...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Prices
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}