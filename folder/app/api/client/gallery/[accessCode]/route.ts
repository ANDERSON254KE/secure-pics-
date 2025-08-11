import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { accessCode: string } }
) {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: {
        accessCode: params.accessCode,
      },
      include: {
        images: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        photographer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check if gallery is expired
    if (gallery.expiresAt && new Date() > gallery.expiresAt) {
      return NextResponse.json({ error: 'Gallery has expired' }, { status: 410 })
    }

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Error fetching client gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}