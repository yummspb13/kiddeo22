// Транслитерация русских букв в латиницу
function transliterate(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }
  
  return text.replace(/[а-яёА-ЯЁ]/g, (char) => translitMap[char] || char)
}

// Улучшенные функции для работы со slug
export function slugify(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    // Транслитерируем русский текст в латиницу
    .replace(/[а-яёА-ЯЁ]/g, (char) => {
      const translitMap: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }
      return translitMap[char] || char
    })
    // Оставляем только латиницу, цифры, пробелы и дефисы
    .replace(/[^a-z0-9\s-]/g, '')
    // Заменяем множественные пробелы на один дефис
    .replace(/\s+/g, '-')
    // Убираем множественные дефисы
    .replace(/-+/g, '-')
    // Убираем дефисы в начале и конце
    .replace(/^-+|-+$/g, '')
}

// Генерирует уникальный slug, добавляя число если нужно
export async function generateUniqueSlug(
  baseText: string, 
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  const baseSlug = slugify(baseText)
  if (!baseSlug) return 'item-' + Date.now()
  
  let slug = baseSlug
  let attempt = 1
  
  while (attempt <= maxAttempts) {
    const exists = await checkExists(slug)
    if (!exists) return slug
    
    slug = `${baseSlug}-${attempt}`
    attempt++
  }
  
  // Если не удалось найти уникальный slug, добавляем timestamp
  return `${baseSlug}-${Date.now()}`
}

// Универсальная функция для проверки существования slug в любой таблице
export async function checkSlugExistsUniversal(
  slug: string,
  table: string,
  excludeId?: number
): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/api/check-slug?slug=${encodeURIComponent(slug)}&table=${encodeURIComponent(table)}${excludeId ? `&excludeId=${excludeId}` : ''}`
    const response = await fetch(url)
    if (!response.ok) return false
    const data = await response.json()
    return data.exists || false
  } catch (error) {
    console.error('Error checking slug:', error)
    return false
  }
}

// Проверяет, существует ли slug в базе данных (для событий)
export async function checkSlugExists(slug: string): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'AfishaEvent')
}

// Проверяет, существует ли slug в базе данных (для городов)
export async function checkCitySlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'City', excludeId)
}

// Проверяет, существует ли slug в базе данных (для категорий)
export async function checkCategorySlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'Category', excludeId)
}

// Проверяет, существует ли slug в базе данных (для листингов)
export async function checkListingSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'Listing', excludeId)
}

// Проверяет, существует ли slug в базе данных (для контента)
export async function checkContentSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'Content', excludeId)
}

// Проверяет, существует ли slug в базе данных (для партнеров)
export async function checkVenuePartnerSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'VenuePartner', excludeId)
}
