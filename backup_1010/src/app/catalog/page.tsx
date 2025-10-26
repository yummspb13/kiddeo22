import { Suspense } from "react"
import { Metadata } from "next"
import { getCachedCities } from "@/lib/cache"
import CatalogClient from "./CatalogClient"
import { EventListSkeleton } from "@/components/catalog/EventCardSkeleton"

export const metadata: Metadata = {
  title: "Каталог событий и мест для детей | KidsReview",
  description: "Найдите лучшие мероприятия, места и развлечения для детей в вашем городе. Афиша событий, каталог мест, бронирование билетов.",
  keywords: "детские мероприятия, афиша, события, места для детей, развлечения, бронирование",
}

export default async function CatalogPage() {
  const cities = await getCachedCities()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Каталог событий и мест
          </h1>
          <p className="text-gray-600">
            Найдите лучшие мероприятия и места для детей в вашем городе
          </p>
        </div>

        <Suspense fallback={<EventListSkeleton count={6} />}>
          <CatalogClient cities={cities} />
        </Suspense>
      </div>
    </div>
  )
}
