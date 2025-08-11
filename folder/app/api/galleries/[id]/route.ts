import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const gallery = await prisma.gallery.findUnique({
      where: {
        id: params.id,
      },
      include: {
        images: true,
        photographer: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            images: true,
            orders: true,
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check if user has access to this gallery
    // @ts-expect-error: user.id is added via NextAuth callback
    const hasAccess = session?.user?.id === gallery.photographerId
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const gallery = await prisma.gallery.findUnique({
      where: { id: params.id },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.photographerId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedGallery = await prisma.gallery.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        clientEmail: body.clientEmail,
        clientName: body.clientName,
        isActive: body.isActive,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: {
        images: true,
        _count: {
          select: {
            images: true,
            orders: true,
          },
        },
      },
    })

    return NextResponse.json(updatedGallery)
  } catch (error) {
    console.error('Error updating gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gallery = await prisma.gallery.findUnique({
      where: { id: params.id },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.photographerId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.gallery.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Gallery deleted successfully' })
  } catch (error) {
    console.error('Error deleting gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}