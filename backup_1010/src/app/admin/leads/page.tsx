// src/app/admin/leads/page.tsx
import prisma from '@/lib/db'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  const leads = await prisma.lead.findMany({
    orderBy: { id: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Лиды</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Имя</th>
              <th className="p-3 text-left">Телефон</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Сообщение</th>
              <th className="p-3 text-left">Создано</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.id}</td>
                <td className="p-3">{(l as any).name ?? '—'}</td>
                <td className="p-3">{(l as any).phone ?? '—'}</td>
                <td className="p-3">{(l as any).email ?? '—'}</td>
                <td className="p-3 max-w-[420px] truncate">{(l as any).message ?? (l as any).question ?? '—'}</td>
                <td className="p-3">{new Date((l as any).createdAt ?? Date.now()).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href={`/admin${k}`} className="text-sm text-blue-600 hover:underline">← В админ-панель</a>
    </div>
  )
}
