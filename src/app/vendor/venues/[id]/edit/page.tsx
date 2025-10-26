import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/auth-server"
import { prisma } from '@/lib/db'
import EditVenueClient from './EditVenueClient'

interface EditVenuePageProps {
  params: {
    id: string
  }
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const session = await getServerSession()
  
  if (!session?.user?.uid) {
    redirect('/?login=true')
  }

  // Проверяем, что пользователь является вендором
  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.uid }
  })

  if (!vendor) {
    redirect('/vendor/onboarding')
  }

  // Получаем место для редактирования
  const { id } = await params
  const venueId = parseInt(id)
  const venue = await prisma.venuePartner.findFirst({
    where: {
      id: venueId,
      vendorId: vendor.id
    },
    include: {
      subcategory: {
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })

  // Парсим дополнительные изображения
  let additionalImages: string[] = []
  if (venue?.additionalImages) {
    try {
      additionalImages = JSON.parse(venue.additionalImages)
    } catch (error) {
      console.error('Error parsing additional images:', error)
    }
  }

  if (!venue) {
    redirect('/vendor/venues')
  }

  // Получаем подкатегории для выбора
  const subcategories = await prisma.venueSubcategory.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  // Получаем города
  const cities = await prisma.city.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: { name: 'asc' }
  })

  return (
    <EditVenueClient
      venue={venue}
      vendor={vendor}
      subcategories={subcategories}
      cities={cities}
      additionalImages={additionalImages}
    />
  )
}
