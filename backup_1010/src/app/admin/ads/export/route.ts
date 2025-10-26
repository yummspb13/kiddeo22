import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fromS = url.searchParams.get('from') // YYYY-MM-DD
  const toS   = url.searchParams.get('to')   // YYYY-MM-DD

  const today = new Date()
  const defFrom = new Date(today.getTime() - 30*24*60*60*1000)

  // Встроенные методы вместо date-fns
  const parseDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }
  
  const startOfDay = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }
  
  const endOfDay = (date: Date) => {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
  }

  const from = fromS && parseDate(fromS) ? startOfDay(parseDate(fromS)!) : startOfDay(defFrom)
  const to   = toS   && parseDate(toS)   ? endOfDay(parseDate(toS)!)     : endOfDay(today)

  const events = await prisma.adEvent.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      createdAt: true,
      type: true,
      adPlacementId: true,
      AdPlacement: { select: { title: true, page: true, position: true, cityId: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // агрегируем по YYYY-MM-DD + adPlacementId + type
  type Row = { date: string; adId: number; title: string; page: string; position: string; impressions: number; clicks: number }
  const map = new Map<string, Row>()

  for (const e of events) {
    const date = e.createdAt.toISOString().slice(0,10)
    const key = `${date}:${e.adPlacementId}`
    const row = map.get(key) ?? {
      date,
      adId: e.adPlacementId,
      title: e.AdPlacement?.title ?? '',
      page: e.AdPlacement?.page ?? '',
      position: e.AdPlacement?.position ?? '',
      impressions: 0,
      clicks: 0,
    }
    if (e.type === 'IMPRESSION') row.impressions++
    else if (e.type === 'CLICK') row.clicks++
    map.set(key, row)
  }

  const rows = Array.from(map.values()).sort((a,b) =>
    a.date === b.date ? a.adId - b.adId : a.date.localeCompare(b.date)
  )

  const header = ['date','adId','title','page','position','impressions','clicks']
  const csv = [header.join(','), ...rows.map(r => [
    r.date, r.adId, csvEscape(r.title), r.page, r.position, r.impressions, r.clicks
  ].join(','))].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'cache-control': 'no-store',
      'content-disposition': `attachment; filename="ads-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}

function csvEscape(s: string) {
  const needs = /[",\n]/.test(s)
  if (!needs) return s
  return `"${s.replace(/"/g,'""')}"`
}
