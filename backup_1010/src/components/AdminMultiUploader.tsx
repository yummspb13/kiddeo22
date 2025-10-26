'use client'

import { useRef, useState } from 'react'

type Props = {
  value: string[]
  onChange: (urls: string[]) => void
  accept?: string
  maxSizeMb?: number
  maxCount?: number
}

export default function AdminMultiUploader({ value, onChange, accept = 'image/*', maxSizeMb = 8, maxCount = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const startUpload = async (files: FileList | File[]) => {
    const filesArr = Array.from(files)
    if (filesArr.length === 0) return
    const spaceLeft = Math.max(0, maxCount - value.length)
    const toUpload = filesArr.slice(0, spaceLeft)
    if (toUpload.length === 0) return

    setError(null)
    setUploading(true)
    setProgress(new Array(toUpload.length).fill(0))

    const uploaded: string[] = []
    for (let i = 0; i < toUpload.length; i++) {
      const f = toUpload[i]
      if (!f.type.startsWith('image/')) {
        setError('Можно загружать только изображения')
        continue
      }
      if (f.size > maxSizeMb * 1024 * 1024) {
        setError(`Размер каждого файла не более ${maxSizeMb}MB`)
        continue
      }
      // Имитация прогресса: так как fetch FormData не даёт прогресс, делаем плавную индикацию
      setProgress(prev => prev.map((p, idx) => (idx === i ? 10 : p)))
      const formData = new FormData()
      formData.append('file', f)
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const json = await res.json()
        if (json?.success && json?.url) {
          uploaded.push(json.url)
          setProgress(prev => prev.map((p, idx) => (idx === i ? 100 : p)))
        } else {
          setError(json?.error || 'Ошибка загрузки')
          setProgress(prev => prev.map((p, idx) => (idx === i ? 0 : p)))
        }
      } catch (e) {
        setError('Ошибка загрузки')
        setProgress(prev => prev.map((p, idx) => (idx === i ? 0 : p)))
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded])
    setUploading(false)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) startUpload(e.target.files)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    if (e.dataTransfer.files) startUpload(e.dataTransfer.files)
  }

  const remove = (idx: number) => {
    const next = [...value]; next.splice(idx, 1); onChange(next)
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${uploading ? 'opacity-70' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
        onDrop={onDrop}
      >
        <input ref={inputRef} type="file" accept={accept} multiple onChange={onInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
        <div className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">Кликните</span> или перетащите файлы сюда
          <div className="text-xs text-gray-500 mt-1">До {maxCount} фото, по {maxSizeMb}MB</div>
        </div>
        {uploading && (
          <div className="mt-3 space-y-1">
            {progress.map((p, i) => (
              <div key={i} className="h-1.5 bg-gray-200 rounded">
                <div className="h-1.5 rounded bg-blue-600 transition-all" style={{ width: `${p}%` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {value.map((src, idx) => (
            <div key={idx} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="img" className="w-full h-28 object-cover rounded-lg" />
              <button type="button" className="absolute top-2 right-2 text-xs bg-black/70 text-white rounded px-2 py-0.5 opacity-0 group-hover:opacity-100" onClick={() => remove(idx)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


