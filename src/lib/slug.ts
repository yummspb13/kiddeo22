export function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[ё]/g, 'e')
      .replace(/[^a-z0-9\u0430-\u044f\s-]/g, '') // латиница+кириллица+цифры+пробелы+-
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
  