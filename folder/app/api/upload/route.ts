import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const galleryId = formData.get('galleryId') as string
    const files = formData.getAll('files') as File[]

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 })
    }

    // Verify gallery ownership
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
    })

    if (!gallery || gallery.photographerId !== session.user.id) {
      return NextResponse.json({ error: 'Gallery not found or access denied' }, { status: 403 })
    }

    const uploadedImages = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', galleryId)

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    for (const file of files) {
      if (!file || !(file instanceof File)) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = join(uploadDir, filename)

      // Save file
      await writeFile(filepath, buffer)

      // Create image record in database
      const image = await prisma.image.create({
        data: {
          filename: file.name,
          originalUrl: `/uploads/${galleryId}/${filename}`,
          thumbnailUrl: `/uploads/${galleryId}/${filename}`, // For now, same as original
          galleryId: galleryId,
          size: buffer.length,
          // You might want to extract width/height using sharp or similar
        },
      })

      uploadedImages.push(image)
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      images: uploadedImages,
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}