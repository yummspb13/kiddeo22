// src/app/admin/cities/page.tsx
import prisma from '@/lib/db'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = keySuffix(sp)

  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Города</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Слаг</th>
              <th className="p-3 text-left">Название</th>
              <th className="p-3 text-left">Публичен</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.slug}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">
                  <form action={toggleCityPublic}>
                    <input type="hidden" name="cityId" value={c.id} />
                    <input type="hidden" name="value" value={(!c.isPublic).toString()} />
                    <button className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                      {c.isPublic ? 'Да' : 'Нет'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href={`/admin${k}`} className="text-sm text-blue-600 hover:underline">← В админ-панель</a>
    </div>
  )
}

export async function toggleCityPublic(formData: FormData) {
  'use server'
  const id = Number(formData.get('cityId'))
  const value = String(formData.get('value')) === 'true'
  if (!id) return

  await prisma.city.update({ where: { id }, data: { isPublic: value } })
  revalidatePath('/admin/cities')
}
