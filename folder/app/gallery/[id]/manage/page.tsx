'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/layout/navbar'
import { ArrowLeft, Save, Share2, Copy, Eye, Trash2, Upload } from 'lucide-react'
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
  expiresAt?: string
  createdAt: string
  views: number
  downloads: number
  _count: {
    images: number
    orders: number
  }
}

export default function ManageGalleryPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    clientEmail: '',
    isActive: true,
    expiresAt: ''
  })

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
        setFormData({
          name: data.name,
          description: data.description || '',
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          isActive: data.isActive,
          expiresAt: data.expiresAt ? data.expiresAt.split('T')[0] : ''
        })
      } else {
        setError('Gallery not found or access denied')
      }
    } catch (error) {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/galleries/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null
        }),
      })

      if (response.ok) {
        const updatedGallery = await response.json()
        setGallery(updatedGallery)
        toast.success('Gallery updated successfully')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update gallery')
        toast.error('Failed to update gallery')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      toast.error('An error occurred')
    } finally {
      setIsSaving(false)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked
    })
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
              <h1 className="text-3xl font-bold">Manage Project</h1>
              <p className="text-muted-foreground mt-2">
                Update project settings and view analytics
              </p>
            </div>
            <Badge variant={gallery?.isActive ? "default" : "secondary"}>
              {gallery?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Update your project information and client details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Gallery Expiration</Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isActive">Gallery is active</Label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={copyShareLink} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Share Link
                </Button>
                <Button onClick={previewGallery} variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Client Gallery
                </Button>
                <Link href={`/gallery/${gallery?.id}/upload`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload More Images
                  </Button>
                </Link>
                <Link href={`/gallery/${gallery?.id}/pricing`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <span className="h-4 w-4 mr-2">$</span>
                    Manage Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-medium">{gallery?._count.images || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{gallery?.views || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Downloads</span>
                  <span className="font-medium">{gallery?.downloads || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {gallery?.createdAt ? new Date(gallery.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Share Info */}
            <Card>
              <CardHeader>
                <CardTitle>Share Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Access Code</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {gallery?.accessCode}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}