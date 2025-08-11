'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { FileUpload } from '@/components/ui/file-upload'
import { ArrowLeft, Upload, Share2, Eye, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Gallery {
  id: string
  name: string
  description?: string
  clientName: string
  clientEmail: string
  accessCode: string
  isActive: boolean
  _count: {
    images: number
  }
}

export default function UploadPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [error, setError] = useState('')

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
      } else {
        setError('Gallery not found or access denied')
      }
    } catch (error) {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!gallery) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('galleryId', gallery.id)
      
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadedFiles(prev => [...prev, ...result.images.map((img: any) => img.filename)])
        setUploadProgress(100)
        
        // Refresh gallery data
        await fetchGallery()
        
        toast.success(`Successfully uploaded ${result.images.length} images`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
        toast.error('Upload failed')
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const copyShareLink = () => {
    if (!gallery) return
    
    const shareLink = `${window.location.origin}/client/${gallery.accessCode}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }

  const previewGallery = () => {
    if (!gallery) return
    window.open(`/client/${gallery.accessCode}`, '_blank')
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{gallery?.name}</h1>
              <p className="text-muted-foreground mt-2">
                Upload images for {gallery?.clientName}
              </p>
            </div>
            <Badge variant={gallery?.isActive ? "default" : "secondary"}>
              {gallery?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Gallery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images Uploaded</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gallery?._count.images || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{gallery?.clientName}</div>
              <div className="text-sm text-muted-foreground">{gallery?.clientEmail}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Share Gallery</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={copyShareLink} variant="outline" size="sm" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={previewGallery} variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Gallery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Drag and drop your images here or click to browse. Supports JPG, PNG, and WebP files up to 10MB each.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FileUpload
              onFilesSelected={handleFileUpload}
            />  
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Pricing Information</h4>
              <p className="text-sm text-muted-foreground">
                All uploaded images will have a default price of $10.00. You can adjust individual 
                image prices in the gallery management section after upload.
              </p>
            </div>

            {isUploading && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Share Link:</span>
                  <Button 
                    onClick={copyShareLink} 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Recently Uploaded:</h4>
                <div className="space-y-1">
                  {uploadedFiles.map((filename, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {filename}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Link href="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
          <div className="space-x-4">
            <Button onClick={previewGallery} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview Gallery
            </Button>
            <Link href={`/gallery/${gallery?.id}/manage`}>
              <Button>
                Manage Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}