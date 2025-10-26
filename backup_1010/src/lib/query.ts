// src/lib/query.ts
export function str(v: unknown): string | undefined {
  const s = typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
  return s?.trim() ? s.trim() : undefined
}

export function parseCsvParam(sp: Record<string, unknown>, key: string): string[] {
  const raw = str((sp as any)[key])
  if (!raw) return []
  return raw.split(",").map(s => s.trim()).filter(Boolean)
}
