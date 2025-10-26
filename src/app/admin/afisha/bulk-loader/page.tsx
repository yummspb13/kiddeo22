// src/app/admin/afisha/bulk-loader/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import BulkLoaderClient from './BulkLoaderClient'

export const dynamic = 'force-dynamic'

export default async function BulkLoaderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  return (
    <div className="space-y-6 font-unbounded">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-unbounded">Пакетный загрузчик</h1>
          <p className="text-sm text-gray-600">Массовая загрузка мероприятий и мест из Excel файлов</p>
        </div>
      </div>

      <BulkLoaderClient />
    </div>
  )
}
