import { NextRequest } from "next/server"
import prisma from "@/lib/db"

// Кэш для хранения информации о последних действиях пользователей
const userActionCache = new Map<string, { lastView: number; lastClick: number; viewCount: number; clickCount: number }>()

// Очистка кэша каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of userActionCache.entries()) {
    if (now - value.lastView > 5 * 60 * 1000) { // 5 минут
      userActionCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function getClientFingerprint(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const acceptLanguage = request.headers.get("accept-language") || "unknown"
  
  // Создаем отпечаток на основе IP, User-Agent и Accept-Language
  return Buffer.from(`${ip}-${userAgent}-${acceptLanguage}`).toString("base64").slice(0, 32)
}

export function isThrottled(fingerprint: string, action: "view" | "click"): boolean {
  const now = Date.now()
  const userData = userActionCache.get(fingerprint) || { 
    lastView: 0, 
    lastClick: 0, 
    viewCount: 0, 
    clickCount: 0 
  }

  if (action === "view") {
    // Максимум 1 просмотр в секунду
    if (now - userData.lastView < 1000) {
      return true
    }
    // Максимум 100 просмотров в час
    if (userData.viewCount > 100 && now - userData.lastView < 60 * 60 * 1000) {
      return true
    }
  } else if (action === "click") {
    // Максимум 1 клик в 5 секунд
    if (now - userData.lastClick < 5000) {
      return true
    }
    // Максимум 10 кликов в час
    if (userData.clickCount > 10 && now - userData.lastClick < 60 * 60 * 1000) {
      return true
    }
  }

  return false
}

export function recordAction(fingerprint: string, action: "view" | "click"): void {
  const now = Date.now()
  const userData = userActionCache.get(fingerprint) || { 
    lastView: 0, 
    lastClick: 0, 
    viewCount: 0, 
    clickCount: 0 
  }

  if (action === "view") {
    userData.lastView = now
    userData.viewCount++
  } else if (action === "click") {
    userData.lastClick = now
    userData.clickCount++
  }

  userActionCache.set(fingerprint, userData)
}

export async function logAdEvent(
  adPlacementId: number,
  type: "IMPRESSION" | "CLICK",
  fingerprint: string,
  request: NextRequest
) {
  try {
    // Проверяем, не заблокирован ли пользователь
    if (isThrottled(fingerprint, type === "IMPRESSION" ? "view" : "click")) {
      console.log(`Blocked ${type} from ${fingerprint} due to throttling`)
      return false
    }

    // Записываем действие в кэш
    recordAction(fingerprint, type === "IMPRESSION" ? "view" : "click")

    // Получаем информацию о запросе
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referer = request.headers.get("referer") || "unknown"

    // Сохраняем событие в базу данных
    await prisma.adEvent.create({
      data: {
        adPlacementId,
        type,
        ip,
        ua: userAgent
      }
    })

    return true
  } catch (error) {
    console.error("Error logging ad event:", error)
    return false
  }
}

export async function getAdStats(adPlacementId: number, days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await prisma.adEvent.groupBy({
    by: ["type"],
    where: {
      adPlacementId,
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    }
  })

  const uniqueStats = await prisma.adEvent.groupBy({
    by: ["type"],
    where: {
      adPlacementId,
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    }
  })

  const result = {
    impressions: 0,
    clicks: 0,
    uniqueImpressions: 0,
    uniqueClicks: 0,
    ctr: 0
  }

  stats.forEach(stat => {
    if (stat.type === "IMPRESSION") {
      result.impressions = stat._count.id
    } else if (stat.type === "CLICK") {
      result.clicks = stat._count.id
    }
  })

  // Calculate unique impressions
  const impressionEvents = await prisma.adEvent.findMany({
    where: {
      adPlacementId,
      type: "IMPRESSION",
      createdAt: { gte: startDate }
    },
    select: { id: true }
  })
  const uniqueFingerprints = new Set(impressionEvents.map(e => e.id))
  result.uniqueImpressions = uniqueFingerprints.size

  // Calculate unique clicks
  const clickEvents = await prisma.adEvent.findMany({
    where: {
      adPlacementId,
      type: "CLICK",
      createdAt: { gte: startDate }
    },
    select: { id: true }
  })
  const uniqueClickFingerprints = new Set(clickEvents.map(e => e.id))
  result.uniqueClicks = uniqueClickFingerprints.size

  if (result.impressions > 0) {
    result.ctr = (result.clicks / result.impressions) * 100
  }

  return result
}
