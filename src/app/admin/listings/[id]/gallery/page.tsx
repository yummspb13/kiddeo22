import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import ListingGalleryEditor from '../../ListingGalleryEditor'

export const dynamic = 'force-dynamic'

async function saveGallery(formData: FormData) {
  'use server'
  const id = Number(formData.get('id') || 0)
  const images = String(formData.get('images') || '[]')
  await prisma.listing.update({ where: { id }, data: { images } as any })
  revalidatePath(`/admin/listings/${id}/gallery`)
}

export default async function ListingGalleryPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true, images: true } })
  const initial = (() => {
    try {
      const raw = (listing as any)?.images
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  })()
  return <ListingGalleryEditor id={id} initialImages={initial} onSave={saveGallery} />
}


