// src/components/AfishaSortBar.tsx
type Props = {
    slug: string
    sp: Record<string, string | string[] | undefined>
    current?: string
  }
  
  function buildHref(base: string, sp: Props['sp'], patch: Record<string, string | null>) {
    const qs = new URLSearchParams(
      Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? '' : v ?? ''])
    )
    // при смене сортировки всегда сбрасываем на первую страницу
    qs.delete('page')
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) qs.delete(k)
      else qs.set(k, v)
    }
    return `${base}?${qs.toString()}`
  }
  
  export default function AfishaSortBar({ slug, sp, current = 'new' }: Props) {
    const base = `/city/${slug}/cat/events`
    const items = [
      { key: 'new', label: 'по новизне' },
      { key: 'date_asc', label: 'по дате (раньше)' },
      { key: 'price_asc', label: 'цена ↑' },
      { key: 'price_desc', label: 'цена ↓' },
    ] as const
  
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="mr-1">Сортировка:</span>
        <nav className="flex flex-wrap gap-1.5">
          {items.map((it) => {
            const active = current === it.key
            const href = buildHref(base, sp, { sort: it.key })
            return (
              <a
                key={it.key}
                href={href}
                className={`px-2.5 py-1 rounded-md border transition
                  ${active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
              >
                {it.label}
              </a>
            )
          })}
        </nav>
      </div>
    )
  }
  