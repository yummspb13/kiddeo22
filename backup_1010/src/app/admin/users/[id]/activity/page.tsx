import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import prisma from '@/lib/db'
import UserActivityClient from './UserActivityClient'

export const dynamic = 'force-dynamic'

export default async function UserActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  const userId = parseInt(id)
  if (isNaN(userId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Неверный ID пользователя</h1>
          <a href={`/admin/users${k}`} className="text-blue-600 hover:underline">
            ← Вернуться к списку пользователей
          </a>
        </div>
      </div>
    )
  }

  // Получаем информацию о пользователе
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Пользователь не найден</h1>
          <a href={`/admin/users${k}`} className="text-blue-600 hover:underline">
            ← Вернуться к списку пользователей
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserActivityClient user={user as any} />
      </div>
    </div>
  )
}

