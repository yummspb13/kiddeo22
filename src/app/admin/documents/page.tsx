import { Suspense } from 'react'
import DocumentsClient from './DocumentsClient'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function DocumentsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управление документами</h1>
        <p className="text-gray-600">Просмотр и модерация документов вендоров</p>
      </div>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <DocumentsClient searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
