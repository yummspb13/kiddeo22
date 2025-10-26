// src/app/vendor/leads/page.tsx
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
type LeadStatus = 'NEW' | 'IN_REVIEW' | 'REPLIED' | 'WON' | 'LOST' | 'SPAM'

export const dynamic = 'force-dynamic'

async function setStatus(formData: FormData) {
  'use server'
  const session = await getServerSession()
  const uid = session?.user?.uid
  if (!uid) return

  const vendor = await prisma.vendor.findUnique({ where: { userId: uid } })
  if (!vendor) return

  const id = Number(formData.get('id') || 0)
  const status = String(formData.get('status') || 'NEW') as LeadStatus
  if (!id) return

  await prisma.lead.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/vendor/leads')
}

export default async function VendorLeadsPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const session = await getServerSession()
  const uid = session?.user?.uid
  if (!uid) redirect('/?login=true')

  const vendor = await prisma.vendor.findUnique({ where: { userId: uid } })
  if (!vendor) redirect('/vendor/onboarding')

  const statusFilter = typeof searchParams?.status === 'string' ? searchParams!.status : undefined
  const leads = await prisma.lead.findMany({
    where: {
      vendorId: vendor.id,
      ...(statusFilter ? { status: statusFilter as LeadStatus } : {}),
    },
    include: {
      Listing: { select: { slug: true, title: true, bookingMode: true } },
      City: { select: { name: true } },
    },
    orderBy: { id: 'desc' },
  })

  const statuses = ['NEW', 'IN_REVIEW', 'REPLIED', 'WON', 'LOST', 'SPAM']

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Мои лиды</h1>
      <div className="text-sm">Вендор: <b>{vendor.displayName}</b></div>

      <div className="flex gap-3 text-sm">
        <a className="underline" href="/vendor/leads">Все</a>
        {statuses.map(s => (
          <a key={s} className="underline" href={`/vendor/leads?status=${s}`}>{s}</a>
        ))}
      </div>

      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="border-b p-2">#</th>
              <th className="border-b p-2">Когда</th>
              <th className="border-b p-2">Листинг</th>
              <th className="border-b p-2">Клиент</th>
              <th className="border-b p-2">Сообщение</th>
              <th className="border-b p-2">Желаемо</th>
              <th className="border-b p-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td className="border-b p-2">{lead.id}</td>
                <td className="border-b p-2">{new Date(lead.createdAt).toLocaleString()}</td>
                <td className="border-b p-2">
                  <div className="grid">
                    <a className="underline" href={`/listing/${lead.Listing.slug}`}>{lead.Listing.title}</a>
                    <span className="opacity-70 text-xs">{lead.City?.name ?? '—'}</span>
                  </div>
                </td>
                <td className="border-b p-2">
                  <div><b>{lead.name}</b></div>
                  {lead.phone && <div>{lead.phone}</div>}
                  {lead.email && <div>{lead.email}</div>}
                </td>
                <td className="border-b p-2 max-w-[320px]">{lead.message ?? '—'}</td>
                <td className="border-b p-2">{lead.desiredAt ? new Date(lead.desiredAt).toLocaleString() : '—'}</td>
                <td className="border-b p-2">
                  <form action={setStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select name="status" defaultValue={lead.status} className="border rounded-md h-9 px-2">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="border rounded-md h-9 px-3 bg-white cursor-pointer">OK</button>
                  </form>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} className="p-3 opacity-70">Лидов пока нет.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
