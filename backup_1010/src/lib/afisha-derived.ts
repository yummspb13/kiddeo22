// src/lib/afisha-derived.ts
import type { AgeBandKey } from './afisha-filters'
import { normalizeAgeRangeFromBands } from './afisha-filters'

export function computeAgeFromToFromAdminSelection(selectedAgeBands: AgeBandKey[]) {
  // в админке выбирается несколько бендов — сводим к min..max
  return normalizeAgeRangeFromBands(selectedAgeBands)
}

export function computeMinPriceFromTickets(tickets: Array<{ price: number | null | undefined }>) {
  const nums = tickets.map(t => t.price).filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  if (!nums.length) return null
  return Math.min(...nums)
}
