// src/lib/admin-guard.ts
import { notFound } from "next/navigation"
import { cookies } from "next/headers"

type SP = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>

function getParam(sp: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const v = sp?.[name]
  if (typeof v === "string") return v.trim() || undefined
  if (Array.isArray(v)) return v[0]?.trim() || undefined
  return undefined
}

/** Вернёт "?key=..." если ключ есть в query, иначе пустую строку */
export async function keySuffix(sp: SP): Promise<string> {
  try {
    const resolvedSp = await sp
    const key = getParam(resolvedSp, "key")
    return key ? `?key=${key}` : ""
  } catch (error) {
    console.error("Error in keySuffix:", error)
    return ""
  }
}

/**
 * Пускаем если:
 *  - есть сервисная кука ("ak" для admin, "vk" для vendor), поставленная middleware, ИЛИ
 *  - в query есть валидный ?key=...
 *
 * В dev по умолчанию ключ "kidsreview2025", в prod — берём из ENV.
 * Иначе — скрываем страницу через 404.
 */
export async function requireAdminOrDevKey(sp: SP, scope: "admin" | "vendor" = "admin") {
  try {
    const isDev = process.env.NODE_ENV !== "production"
    console.log("🔍 requireAdminOrDevKey: isDev =", isDev, "NODE_ENV =", process.env.NODE_ENV)
    
    // В dev режиме разрешаем доступ без аутентификации
    if (isDev) {
      console.log("Dev mode: allowing access to admin panel")
      return {
        success: true,
        user: {
          id: 1,
          name: 'Dev Admin',
          email: 'admin@dev.local'
        }
      }
    }

    const c = await cookies()
    const cookieFlag = scope === "admin" ? c.get("ak")?.value : c.get("vk")?.value
    if (cookieFlag === "1") return {
      success: true,
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@system.local'
      }
    }

    const resolvedSp = await sp
    const key = getParam(resolvedSp, "key")

    const expectedKey =
      scope === "admin"
        ? (process.env.ADMIN_KEY || "").trim()
        : (process.env.VENDOR_KEY || "").trim()

    console.log("Debug - Key:", key, "Expected:", expectedKey, "IsDev:", isDev, "ResolvedSp:", resolvedSp)

    if (key && expectedKey && key === expectedKey) return {
      success: true,
      user: {
        id: 1,
        name: 'Key Admin',
        email: 'key@system.local'
      }
    }

    console.log("Access denied. Key:", key, "Expected:", expectedKey, "IsDev:", isDev)
    notFound()
  } catch (error) {
    console.error("Error in requireAdminOrDevKey:", error)
    notFound()
  }
}
