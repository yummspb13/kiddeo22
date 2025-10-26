"use client"

import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, Save } from 'lucide-react'

export default function FeaturesManager({ venueId }: { venueId: number }) {
  const [items, setItems] = useState<Array<{ icon?: string; text: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchFeatures = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/features`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Ошибка загрузки особенностей')
      const data = await res.json()
      setItems(Array.isArray(data.features) ? data.features : [])
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const saveFeatures = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/vendor/venues/${venueId}/features`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: items })
      })
      if (!res.ok) throw new Error('Ошибка сохранения')
      setSuccess('Сохранено')
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId])

  return (
    <div>
      {loading ? (
        <div className="text-gray-600">Загрузка...</div>
      ) : (
        <div className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={it.icon || ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setItems(prev => prev.map((p, i) => i === idx ? { ...p, icon: v } : p))
                  }}
                  placeholder="Иконка (например: shield, star, map-pin)"
                  className="w-56 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={it.text}
                  onChange={(e) => {
                    const v = e.target.value
                    setItems(prev => prev.map((p, i) => i === idx ? { ...p, text: v } : p))
                  }}
                  placeholder="Текст особенности"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setItems(prev => [...prev, { icon: 'Shield', text: '' }])}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить особенность
            </button>
            <button
              type="button"
              onClick={saveFeatures}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


