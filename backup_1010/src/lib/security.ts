// src/lib/security.ts
import crypto from "node:crypto"
import { cookies } from "next/headers"
import prisma from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

const CSRF_COOKIE = "csrf-token"

export async function ensureCsrfToken(): Promise<string> {
  const c = await cookies()
  const existing = c.get(CSRF_COOKIE)?.value
  if (existing) return existing
  const token = crypto.randomBytes(16).toString("hex")
  // Не устанавливаем cookie здесь - только читаем
  return token
}

export async function assertCsrf(formData: FormData) {
  const sent = String(formData.get("csrfToken") || "")
  const c = await cookies()
  const token = c.get(CSRF_COOKIE)?.value || ""
  if (!sent || !token || sent !== token) {
    throw new Error("CSRF token mismatch")
  }
}

export async function audit(action: string, details?: unknown, entity?: { name: string; id?: number }) {
  const session = await getServerSession()
  await prisma.adminAudit.create({
    data: {
      userId: session?.user?.id ?? null,
      action,
      entity: entity?.name,
      entityId: entity?.id ?? null,
      details: details ? (details as any) : undefined,
    },
  })
}

// Server Action для генерации CSRF токена
export async function generateCsrfTokenAction(): Promise<string> {
  const token = crypto.randomBytes(16).toString("hex")
  const c = await cookies()
  c.set(CSRF_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" })
  return token
}
