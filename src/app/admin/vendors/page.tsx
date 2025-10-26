// src/app/admin/vendors/page.tsx
import prisma from '@/lib/db'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)      // <-- пропускаем по роли или по ?key
  const k = await keySuffix(sp)       // <-- чтобы не терять ?key в ссылках

  const vendors = await prisma.vendor.findMany({
    include: { user: true, city: true },
    orderBy: { id: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Вендоры — права публикации</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Название</th>
              <th className="p-3 text-left">Город</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Афиша</th>
              <th className="p-3 text-left">Каталог</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.id}</td>
                <td className="p-3">{v.displayName}</td>
                <td className="p-3">{v.city?.name}</td>
                <td className="p-3">{v.user?.email}</td>
                <td className="p-3">
                  <form action={toggleVendorAbility}>
                    <input type="hidden" name="vendorId" value={v.id} />
                    <input type="hidden" name="field" value="canPostEvents" />
                    <input type="hidden" name="value" value={(!v.canPostEvents).toString()} />
                    <button className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                      {v.canPostEvents ? 'Вкл' : 'Выкл'}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={toggleVendorAbility}>
                    <input type="hidden" name="vendorId" value={v.id} />
                    <input type="hidden" name="field" value="canPostCatalog" />
                    <input type="hidden" name="value" value={(!v.canPostCatalog).toString()} />
                    <button className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                      {v.canPostCatalog ? 'Вкл' : 'Выкл'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href={`/admin/dashboard${k}`} className="text-sm text-blue-600 hover:underline">
        ← В админ-панель
      </a>
    </div>
  )
}
export async function toggleVendorAbility(formData: FormData) {
  'use server'
  const id = Number(formData.get('vendorId'))
  const field = String(formData.get('field'))
  const value = String(formData.get('value')) === 'true'
  if (!id || (field !== 'canPostEvents' && field !== 'canPostCatalog')) return

  const data =
    field === 'canPostEvents' ? { canPostEvents: value } : { canPostCatalog: value }

  await prisma.vendor.update({ where: { id }, data })
  revalidatePath('/admin/vendors')
}

