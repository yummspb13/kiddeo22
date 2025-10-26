"use client"

interface Event {
  id: number
  title: string
  description?: string
  imageUrl?: string
  price?: number
  isFree?: boolean
  date?: Date
  endDate?: Date
  address?: string
  lat?: number
  lng?: number
  ageFrom?: number
  ageTo?: number
  category?: string
  vendor?: {
    name: string
    description?: string
  }
}

interface Place {
  id: number
  title: string
  description?: string
  imageUrl?: string
  address?: string
  lat?: number
  lng?: number
  rating?: number
  reviewsCount?: number
  category?: string
  vendor?: {
    name: string
    description?: string
  }
}

interface Offer {
  id: number
  title: string
  description?: string
  price?: number
  isFree?: boolean
  imageUrl?: string
  category?: string
  vendor?: {
    name: string
    description?: string
  }
}

interface StructuredDataProps {
  type: 'event' | 'place' | 'offer'
  data: Event | Place | Offer
  baseUrl?: string
}

export default function StructuredData({ 
  type, 
  data, 
  baseUrl = 'https://kidsreview.ru' 
}: StructuredDataProps) {
  const generateEventJsonLd = (event: Event) => {
    const startDate = event.date ? new Date(event.date).toISOString() : undefined
    const endDate = event.endDate ? new Date(event.endDate).toISOString() : undefined

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": event.description,
      "image": event.imageUrl ? `${baseUrl}${event.imageUrl}` : undefined,
      "startDate": startDate,
      "endDate": endDate,
      "location": event.address ? {
        "@type": "Place",
        "name": event.address,
        "address": event.address,
        "geo": event.lat && event.lng ? {
          "@type": "GeoCoordinates",
          "latitude": event.lat,
          "longitude": event.lng
        } : undefined
      } : undefined,
      "offers": event.price !== undefined ? {
        "@type": "Offer",
        "price": event.price,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock"
      } : event.isFree ? {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock"
      } : undefined,
      "audience": event.ageFrom || event.ageTo ? {
        "@type": "Audience",
        "audienceType": "Children",
        "ageRange": event.ageFrom && event.ageTo 
          ? `${event.ageFrom}-${event.ageTo}`
          : event.ageFrom 
            ? `${event.ageFrom}+`
            : `0-${event.ageTo}`
      } : undefined,
      "organizer": event.vendor ? {
        "@type": "Organization",
        "name": event.vendor.name,
        "description": event.vendor.description
      } : undefined,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
    }
  }

  const generatePlaceJsonLd = (place: Place) => {
    return {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": place.title,
      "description": place.description,
      "image": place.imageUrl ? `${baseUrl}${place.imageUrl}` : undefined,
      "address": place.address ? {
        "@type": "PostalAddress",
        "streetAddress": place.address
      } : undefined,
      "geo": place.lat && place.lng ? {
        "@type": "GeoCoordinates",
        "latitude": place.lat,
        "longitude": place.lng
      } : undefined,
      "aggregateRating": place.rating ? {
        "@type": "AggregateRating",
        "ratingValue": place.rating,
        "reviewCount": place.reviewsCount || 0
      } : undefined,
      "category": place.category,
      "provider": place.vendor ? {
        "@type": "Organization",
        "name": place.vendor.name,
        "description": place.vendor.description
      } : undefined
    }
  }

  const generateOfferJsonLd = (offer: Offer) => {
    return {
      "@context": "https://schema.org",
      "@type": "Offer",
      "name": offer.title,
      "description": offer.description,
      "image": offer.imageUrl ? `${baseUrl}${offer.imageUrl}` : undefined,
      "price": offer.price || 0,
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "category": offer.category,
      "seller": offer.vendor ? {
        "@type": "Organization",
        "name": offer.vendor.name,
        "description": offer.vendor.description
      } : undefined
    }
  }

  const getJsonLd = () => {
    switch (type) {
      case 'event':
        return generateEventJsonLd(data as Event)
      case 'place':
        return generatePlaceJsonLd(data as Place)
      case 'offer':
        return generateOfferJsonLd(data as Offer)
      default:
        return {}
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getJsonLd(), null, 2)
      }}
    />
  )
}
