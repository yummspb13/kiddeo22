// Утилиты для поиска с поддержкой транслитерации и раскладки клавиатуры

export function generateSearchVariants(query: string): string[] {
  const lower = (s: string) => s.toLowerCase()
  
  // Маппинг раскладки клавиатуры EN -> RU
  const layoutMapEnToRu: Record<string, string> = {
    q:'й', w:'ц', e:'у', r:'к', t:'е', y:'н', u:'г', i:'ш', o:'щ', p:'з', '[':'х', ']':'ъ',
    a:'ф', s:'ы', d:'в', f:'а', g:'п', h:'р', j:'о', k:'л', l:'д', ';':'ж', "'":'э',
    z:'я', x:'ч', c:'с', v:'м', b:'и', n:'т', m:'ь', ',':'б', '.':'ю'
  }
  
  // Маппинг раскладки клавиатуры RU -> EN
  const layoutMapRuToEn: Record<string, string> = Object.fromEntries(
    Object.entries(layoutMapEnToRu).map(([en, ru]) => [ru, en])
  )
  
  function swapLayout(input: string, map: Record<string,string>) {
    return Array.from(input).map(ch => map[lower(ch)] ?? ch).join('')
  }
  
  function toTitleCase(input: string): string {
    return input.replace(/\p{L}[^\s-]*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  }
  
  // Базовая транслитерация EN -> RU
  function translitEnToRu(input: string): string {
    const rules: [RegExp, string][] = [
      [/sch/g, 'щ'], [/sh/g, 'ш'], [/ch/g, 'ч'], [/yo/g, 'ё'], [/yu/g, 'ю'], [/ya/g, 'я'], [/zh/g, 'ж'], [/kh/g, 'х'], [/ts/g, 'ц'],
    ]
    let s = lower(input)
    for (const [re, rep] of rules) s = s.replace(re, rep)
    const map: Record<string,string> = { a:'а', b:'б', v:'в', g:'г', d:'д', e:'е', z:'з', i:'и', j:'й', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', r:'р', s:'с', t:'т', u:'у', f:'ф', h:'х', y:'ы', c:'к' }
    return Array.from(s).map(ch => map[ch] ?? ch).join('')
  }
  
  // Обратная транслитерация RU -> EN
  function translitRuToEn(input: string): string {
    const map: Record<string,string> = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ы':'y','э':'e','ю':'yu','я':'ya' }
    return Array.from(lower(input)).map(ch => map[ch] ?? ch).join('')
  }
  
  const base = query
  const v1 = lower(base)
  const v2 = toTitleCase(v1)
  const swEnRu = swapLayout(base, layoutMapEnToRu)
  const swRuEn = swapLayout(base, layoutMapRuToEn)
  const trEnRu = translitEnToRu(base)
  const trRuEn = translitRuToEn(base)
  const trEnRuTitle = toTitleCase(trEnRu)
  const swEnRuTitle = toTitleCase(swEnRu)
  
  const variants = Array.from(new Set([
    base, v1, v2,
    swEnRu, swRuEn,
    trEnRu, trRuEn, trEnRuTitle, swEnRuTitle,
  ].filter(Boolean))) as string[]
  
  return variants
}

export function createSearchConditions(variants: string[], fields: string[]): unknown {
  const like = (s: string) => `%${s}%`
  
  // Создаем условия для каждого поля
  const fieldConditions = fields.map(field => {
    const titleConds = variants.map(() => `${field} LIKE ?`).join(' OR ')
    return `(${titleConds})`
  }).join(' OR ')
  
  const params = fields.flatMap(() => variants.map(v => like(v)))
  
  return {
    condition: fieldConditions,
    params
  }
}
