import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGallerySchema = z.object({
  name: z.string().min(1, 'Gallery name is required'),
  description: z.string().optional(),
  clientEmail: z.string().email('Valid email is required'),
  clientName: z.string().min(1, 'Client name is required'),
  expiresAt: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

const galleries = await prisma.gallery.findMany({
  where: { photographer: { email: session.user.email! } },
  include: {
    images: true,
    _count: { select: { images: true, orders: true } },
  },
  orderBy: { createdAt: 'desc' },
});

    return NextResponse.json(galleries);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGallerySchema.parse(body);

    const accessCode = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);

    const gallery = await prisma.gallery.create({
      data: {
        ...validatedData,
        photographer: { connect: { email: session.user.email! } },
        accessCode,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
      include: {
        images: true,
        _count: { select: { images: true, orders: true } },
      },
    });

    return NextResponse.json(gallery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error creating gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}