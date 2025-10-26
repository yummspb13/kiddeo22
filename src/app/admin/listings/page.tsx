// src/app/admin/listings/page.tsx
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import ListingGalleryEditor from './ListingGalleryEditor'

export const dynamic = 'force-dynamic'

async function toggleActive(formData: FormData) {
  'use server'
  const id = Number(formData.get('id') || 0)
  const value = String(formData.get('value') || '') === '1'
  if (!id) return
  await prisma.listing.update({ where: { id }, data: { isActive: value } })
  revalidatePath('/admin/listings')
}

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { id: 'desc' },
    include: {
      vendor: { select: { displayName: true } },
      city: { select: { name: true } },
      category: { select: { name: true } },
    },
  })

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Листинги</h1>
        <p className="opacity-70 text-sm">Модерация и публикация.</p>
      </div>

      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="border-b p-2">ID</th>
              <th className="border-b p-2">Заголовок</th>
              <th className="border-b p-2">Вендор</th>
              <th className="border-b p-2">Город</th>
              <th className="border-b p-2">Категория</th>
              <th className="border-b p-2">Режим</th>
              <th className="border-b p-2">Статус</th>
              <th className="border-b p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.id}>
                <td className="border-b p-2">{l.id}</td>
                <td className="border-b p-2">
                  <div className="font-medium">{l.title}</div>
                  <div className="opacity-70 text-xs">{l.slug}</div>
                </td>
                <td className="border-b p-2">{l.vendor.displayName}</td>
                <td className="border-b p-2">{l.city.name}</td>
                <td className="border-b p-2">{l.category.name}</td>
                <td className="border-b p-2">{l.bookingMode}</td>
                <td className="border-b p-2">{l.isActive ? 'ACTIVE' : 'INACTIVE'}</td>
                <td className="border-b p-2 space-x-2">
                  <form action={toggleActive} className="inline-block">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="value" value={l.isActive ? '0' : '1'} />
                    <button className="border rounded-md h-8 px-2 bg-white cursor-pointer">
                      {l.isActive ? 'Снять с публикации' : 'Опубликовать'}
                    </button>
                  </form>
                  <a href={`/admin/listings/${l.id}/gallery`} className="inline-block border rounded-md h-8 px-2 leading-8 bg-white">Галерея</a>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={8} className="p-3 opacity-70">Листингов пока нет.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
