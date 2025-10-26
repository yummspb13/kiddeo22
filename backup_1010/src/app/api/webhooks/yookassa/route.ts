// src/app/api/webhooks/yookassa/route.ts
import { NextRequest, NextResponse } from "next/server"
import { handleYooKassaWebhook } from "@/lib/yookassa"

// POST - Webhook от YooKassa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // В реальной версии здесь должна быть проверка подписи webhook
    // const signature = request.headers.get('x-yookassa-signature')
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    await handleYooKassaWebhook(body)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка обработки webhook YooKassa:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
