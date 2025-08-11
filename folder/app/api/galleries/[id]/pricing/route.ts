import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prices } = await request.json()

    if (!prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'Invalid prices data' }, { status: 400 })
    }

    // Verify gallery ownership
    const gallery = await prisma.gallery.findUnique({
      where: { id: params.id },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (gallery.photographerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update prices for all images
    const updatePromises = Object.entries(prices).map(([imageId, price]) => {
      return prisma.image.update({
        where: { 
          id: imageId,
          galleryId: params.id // Ensure image belongs to this gallery
        },
        data: { 
          price: Number(price) 
        }
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Prices updated successfully' })
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}