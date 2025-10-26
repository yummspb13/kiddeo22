import { NextRequest, NextResponse } from "next/server"
import { requireAdminOrDevKey } from "@/lib/admin-guard"

export async function POST(request: NextRequest) {
  try {
    // Проверяем права доступа
    const url = new URL(request.url)
    const key = url.searchParams.get("key")
    if (key !== "kidsreview2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    // В реальном приложении здесь была бы загрузка в S3/GCS/Cloudflare R2
    // Для демо используем base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Возвращаем URL изображения
    return NextResponse.json({ 
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
