import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const adId = req.nextUrl.searchParams.get('adId')
    const to   = req.nextUrl.searchParams.get('to') ?? '/'
    if (!adId) return NextResponse.redirect(new URL('/', req.url))

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''
    const ua = req.headers.get('user-agent') ?? ''

    await prisma.adEvent.create({
      data: {
        adPlacementId: Number(adId),
        type: 'CLICK',
        ip: ip.slice(0, 255),
        ua: ua.slice(0, 255),
      },
    })

    // безопасный редирект: разрешаем только абсолютные http(s) или относительные
    try {
      const u = new URL(to, req.url)
      return NextResponse.redirect(u, { status: 302 })
    } catch {
      return NextResponse.redirect(new URL('/', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/', req.url))
  }
}
