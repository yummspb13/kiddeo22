'use client'

import AdminMultiUploader from '@/components/AdminMultiUploader'
import { useState } from 'react'

export default function ListingGalleryEditor({ id, initialImages, onSave }: { id: number; initialImages: string[]; onSave: (formData: FormData) => void }) {
  const [images, setImages] = useState<string[]>(initialImages || [])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Галерея листинга #{id}</h1>
        <p className="text-sm text-gray-600">До 20 фотографий. Перетащите сразу несколько, чтобы загрузить пакетно.</p>
      </div>

      <AdminMultiUploader value={images} onChange={setImages} />

      <form action={onSave} className="flex items-center gap-3">
        <input type="hidden" name="id" value={String(id)} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Сохранить</button>
      </form>
    </div>
  )
}


