"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Option = { value: string | number, label: string }

export default function AdminListingCreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [cityId, setCityId] = useState<number | ''>('' as any)
  const [vendorId, setVendorId] = useState<number | ''>('' as any)
  const [type, setType] = useState<'VENUE' | 'SERVICE'>('VENUE')
  const [categoryId, setCategoryId] = useState<number | ''>('' as any)
  const [subcategory, setSubcategory] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')
  const [coverImage, setCoverImage] = useState('')
  const [cities, setCities] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [vendorQuery, setVendorQuery] = useState('')
  const [vendorOptions, setVendorOptions] = useState<Option[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const s = title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
    setSlug(s)
  }, [title])

  useEffect(() => {
    fetch('/api/admin/cities').then(r => r.json()).then(d => {
      setCities((d.cities || []).map((c: any) => ({ value: c.id, label: c.name })))
    }).catch(() => setCities([]))
    fetch('/api/admin/categories').then(r => r.json()).then(d => {
      setCategories((d.categories || []).map((c: any) => ({ value: c.id, label: c.name })))
    }).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    const q = vendorQuery.trim()
    const city = cityId ? String(cityId) : ''
    if (!city) { setVendorOptions([]); return }
    fetch(`/api/admin/vendors/search?q=${encodeURIComponent(q)}&cityId=${city}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setVendorOptions((d.vendors || []).map((v: any) => ({ value: v.id, label: v.displayName }))))
      .catch(() => setVendorOptions([]))
    return () => ctrl.abort()
  }, [vendorQuery, cityId])

  async function handleNext() {
    if (!title || !slug || !cityId || !vendorId || !categoryId) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, cityId: Number(cityId), vendorId: Number(vendorId),
          type, categoryId: Number(categoryId), subcategory,
          address, lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null,
          coverImage,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка сохранения')
      router.push(`/admin/listings/create/step2?id=${data.id}`)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Создать место — Этап 1</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm mb-1">Название</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="Название" />
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input value={slug} readOnly className="w-full border rounded px-3 h-10 bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm mb-1">Город</label>
          <select value={cityId} onChange={e=>setCityId(e.target.value ? Number(e.target.value) : ('' as any))} className="w-full border rounded px-3 h-10">
            <option value="">Выберите город</option>
            {cities.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Владелец (Вендор)</label>
          <input value={vendorQuery} onChange={e=>setVendorQuery(e.target.value)} placeholder="Поиск вендора" className="w-full border rounded px-3 h-10 mb-2" />
          <select value={vendorId} onChange={e=>setVendorId(e.target.value ? Number(e.target.value) : ('' as any))} className="w-full border rounded px-3 h-10">
            <option value="">Выберите вендора</option>
            {vendorOptions.map(v => (<option key={v.value} value={v.value}>{v.label}</option>))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Сначала выберите город, затем ищите вендора</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Тип</label>
          <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border rounded px-3 h-10">
            <option value="VENUE">Место</option>
            <option value="SERVICE">Услуга</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Категория</label>
          <select value={categoryId} onChange={e=>setCategoryId(e.target.value ? Number(e.target.value) : ('' as any))} className="w-full border rounded px-3 h-10">
            <option value="">Выберите категорию</option>
            {categories.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Подкатегория (текст/slug)</label>
          <input value={subcategory} onChange={e=>setSubcategory(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="например: lofty" />
        </div>
        <div>
          <label className="block text-sm mb-1">Адрес</label>
          <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="Улица, дом" />
        </div>

        <div>
          <label className="block text-sm mb-1">Координаты (lat)</label>
          <input value={lat} onChange={e=>setLat(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="55.751244" />
        </div>
        <div>
          <label className="block text-sm mb-1">Координаты (lng)</label>
          <input value={lng} onChange={e=>setLng(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="37.618423" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Обложка (URL)</label>
          <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} className="w-full border rounded px-3 h-10" placeholder="/uploads/cover.jpg" />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleNext} disabled={isSaving} className="px-5 h-10 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {isSaving ? 'Сохраняем…' : 'Перейти к следующему шагу'}
        </button>
      </div>
    </div>
  )
}


