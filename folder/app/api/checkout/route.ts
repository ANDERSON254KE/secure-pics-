import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { galleryId, items, clientEmail, clientName } = await request.json()

    if (!galleryId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Verify gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { images: true }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        galleryId,
        clientEmail,
        clientName,
        total: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        orderItems: {
          create: items.map((item: any) => ({
            imageId: item.imageId,
            price: item.price,
          }))
        }
      }
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => {
        const image = gallery.images.find(img => img.id === item.imageId)
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: image?.filename || 'Photo',
              description: `High-resolution photo from ${gallery.name}`,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        }
      }),
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/client/${gallery.accessCode}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/client/${gallery.accessCode}`,
      customer_email: clientEmail,
      metadata: {
        orderId: order.id,
        galleryId: galleryId,
      },
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}