// src/lib/search-normalize.ts
export function ruLower(s: string) {
  // приводим к нижнему регистру в русской локали и нормализуем "ё" → "е"
  return s
    .toLocaleLowerCase('ru')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildEventSearchText(input: {
  title?: string | null
  description?: string | null
  citySlug?: string | null
  tags?: string[] | null
}) {
  const parts: string[] = []
  if (input.title) parts.push(input.title)
  if (input.description) parts.push(input.description)
  if (input.citySlug) parts.push(input.citySlug)
  if (input.tags?.length) parts.push(input.tags.join(' '))
  return ruLower(parts.join(' '))
}
