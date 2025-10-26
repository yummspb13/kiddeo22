// src/lib/afisha-filters.ts
export type AgeBandKey = '0_3' | '4_7' | '8_12' | '13_16' | '16_plus'

export const AGE_BANDS: Record<AgeBandKey, { from: number; to: number | null; label: string }> = {
  '0_3': { from: 0, to: 3, label: '0–3' },
  '4_7': { from: 4, to: 7, label: '4–7' },
  '8_12': { from: 8, to: 12, label: '8–12' },
  '13_16': { from: 13, to: 16, label: '13–16' },
  '16_plus': { from: 16, to: null, label: '16+' },
}

// синонимы из UI/URL: "0-3", "0–3", "16+", "16plus", "16_plus", "16-99" и т.п.
const AGE_ALIASES: Record<string, AgeBandKey> = {
  '0-3':'0_3','0–3':'0_3','0—3':'0_3','0_3':'0_3',
  '4-7':'4_7','4–7':'4_7','4—7':'4_7','4_7':'4_7',
  '8-12':'8_12','8–12':'8_12','8—12':'8_12','8_12':'8_12',
  '13-16':'13_16','13–16':'13_16','13—16':'13_16','13_16':'13_16',
  '16+':'16_plus','16plus':'16_plus','16_plus':'16_plus','16-99':'16_plus','16–99':'16_plus','16—99':'16_plus',
}

function norm(s: string) { return s.trim().toLowerCase() }

export function parseAgesParam(param?: string | string[]): AgeBandKey[] {
  if (!param) return []
  const raw = Array.isArray(param) ? param.join(',') : param
  const out: AgeBandKey[] = []
  for (const token of raw.split(',')) {
    const t = norm(token)
    if (t in AGE_BANDS) out.push(t as AgeBandKey)
    else if (t in AGE_ALIASES) out.push(AGE_ALIASES[t])
  }
  // убрать дубликаты
  return Array.from(new Set(out))
}

export function normalizeAgeRangeFromBands(bands: AgeBandKey[]): { ageFrom: number | null; ageTo: number | null } {
  if (!bands.length) return { ageFrom: null, ageTo: null }
  let min = Infinity, max = -Infinity
  for (const key of bands) {
    const b = AGE_BANDS[key]
    if (b.from < min) min = b.from
    const to = b.to ?? 99
    if (to > max) max = to
  }
  if (!isFinite(min)) min = 0
  if (!isFinite(max)) max = 99
  return { ageFrom: min, ageTo: max === 99 ? null : max }
}

/** Пересечение диапазонов: событие попадает, если [ageFrom..ageTo] пересекается с любым выбранным бендом */
export function prismaWhereOverlapsSelectedBands(selected: AgeBandKey[]) {
  if (!selected.length) return undefined
  return {
    OR: selected.map(key => {
      const b = AGE_BANDS[key]
      const bFrom = b.from
      const bTo = (b.to ?? 99)
      return {
        AND: [
          { OR: [{ ageFrom: null }, { ageFrom: { lte: bTo } }] },
          { OR: [{ ageTo: null },   { ageTo:   { gte: bFrom } }] },
        ],
      }
    }),
  }
}

export function parseIntOr<T extends number | undefined>(val: string | null, fallback: T): number | T {
  if (!val) return fallback
  const n = parseInt(val, 10)
  return Number.isFinite(n) ? n : fallback
}

/** Пользователь ввёл число (рубли). Оставляем целое. */
export function parsePriceInt(val?: string | string[]) {
  if (!val) return undefined
  const s = Array.isArray(val) ? val[0] : val
  const n = Number(String(s).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? Math.round(n) : undefined
}