'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Plus, Images, Eye, ShoppingCart, Calendar, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Gallery {
  id: string
  name: string
  description?: string
  clientName: string
  clientEmail: string
  accessCode: string
  createdAt: string
  isActive: boolean
  views: number
  images: any[]
  _count: {
    images: number
    orders: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchGalleries()
  }, [session, status, router])

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/galleries')
      if (response.ok) {
        const data = await response.json()
        setGalleries(data)
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAccessLink = (accessCode: string) => {
    const link = `${window.location.origin}/client/${accessCode}`
    navigator.clipboard.writeText(link)
    // You might want to show a toast notification here
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your photo galleries and track client engagement
            </p>
          </div>
          <Link href="/gallery/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Gallery
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{galleries.length}</div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {galleries.reduce((sum, gallery) => sum + gallery._count.images, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {galleries.reduce((sum, gallery) => sum + gallery.views, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Client gallery views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {galleries.reduce((sum, gallery) => sum + (gallery._count.orders || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Images downloaded by clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Galleries Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          
          {galleries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Images className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Create your first project to start sharing photos with your clients
                </p>
                <Link href="/gallery/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <Card key={gallery.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{gallery.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {gallery.description || `Gallery for ${gallery.clientName}`}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              const link = `${window.location.origin}/client/${gallery.accessCode}`
                              navigator.clipboard.writeText(link)
                              toast.success('Share link copied!')
                            }}
                          >
                            Copy Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/client/${gallery.accessCode}`} target="_blank">
                              View Client Gallery
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/gallery/${gallery.id}/pricing`}>
                              Manage Pricing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const link = `${window.location.origin}/client/${gallery.accessCode}`
                              navigator.clipboard.writeText(link)
                              toast.success('Share link copied!')
                            }}
                          >
                            Copy Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/gallery/${gallery.id}/manage`}>
                              Manage Gallery
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/gallery/${gallery.id}/upload`}>
                              Upload Images
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium">{gallery.clientName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={gallery.isActive ? "default" : "secondary"}>
                          {gallery.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-sm font-medium">{gallery._count.images}</div>
                          <div className="text-xs text-muted-foreground">Images</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{gallery.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{gallery._count.orders}</div>
                          <div className="text-xs text-muted-foreground">Downloads</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(gallery.createdAt).toLocaleDateString()}
                        </div>
                        <Link href={`/client/${gallery.accessCode}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            View Gallery
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}