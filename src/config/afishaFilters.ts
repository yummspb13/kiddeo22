// src/config/afishaFilters.ts
export type Range = { min?: number | null; max?: number | null }
export type Bucket = { slug: string; label: string; range: Range }

export const ageBuckets: Bucket[] = [
  { slug: "0-3",      label: "0–3 года",  range: { min: 0,  max: 3 } },
  { slug: "4-7",      label: "4–7 лет",   range: { min: 4,  max: 7 } },
  { slug: "8-12",     label: "8–12 лет",  range: { min: 8,  max: 12 } },
  { slug: "13-16",    label: "13–16 лет", range: { min: 13, max: 16 } },
  { slug: "16-plus",  label: "16+ лет",   range: { min: 16, max: null } },
]

// Маппинг для обратного преобразования из формата фильтров в формат формы
export const ageGroupsFromFilters: Record<string, string> = {
  '0-3': '0–3',
  '4-7': '4–7',
  '8-12': '8–12',
  '13-16': '13–16',
  '16-plus': '16+',
}

export const priceBuckets: Bucket[] = [
  { slug: "free",       label: "Бесплатно",   range: { max: 0 } },
  { slug: "lt-500",     label: "До 500 ₽",    range: { min: 0,    max: 500 } },
  { slug: "500-2000",   label: "500–2000 ₽",  range: { min: 500,  max: 2000 } },
  { slug: "2000-5000",  label: "2000–5000 ₽", range: { min: 2000, max: 5000 } },
  { slug: "gte-10000",  label: "10 000 ₽ +",  range: { min: 10000, max: null } },
]
