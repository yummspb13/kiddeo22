// src/app/api/ads/track/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getClientFingerprint, logAdEvent } from "@/lib/ad-anti-fraud"

export async function POST(request: NextRequest) {
  try {
    const { adPlacementId, type } = await request.json()
    
    if (!adPlacementId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["IMPRESSION", "CLICK"].includes(type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    // Получаем отпечаток клиента для анти-фрод защиты
    const fingerprint = getClientFingerprint(request)
    
    // Логируем событие с проверкой на накрутку
    const success = await logAdEvent(
      parseInt(adPlacementId),
      type as "IMPRESSION" | "CLICK",
      fingerprint,
      request
    )

    if (!success) {
      return NextResponse.json({ error: "Event blocked due to anti-fraud protection" }, { status: 429 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error tracking ad event:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
