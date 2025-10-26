export interface Collection {
  id: string
  title: string
  slug: string
  description?: string
  coverImage?: string
  isActive: boolean
  hideFromAfisha: boolean
  showInVenues: boolean
  showInMain: boolean
  showInBlog: boolean
  order: number
  city: string
  citySlug?: string
  eventsTitle?: string
  eventsDescription?: string
  venuesTitle?: string
  venuesDescription?: string
  createdAt: string
  updatedAt: string
  eventCollections: CollectionEvent[]
  venueCollections: CollectionVenue[]
  _count?: {
    eventCollections: number
    venueCollections: number
  }
}

export interface CollectionEvent {
  id: string
  collectionId: string
  eventId: string
  createdAt: string
  updatedAt: string
  event: AfishaEvent
}

export interface CollectionVenue {
  id: string
  collectionId: string
  venueId: number
  order: number
  createdAt: string
  updatedAt: string
  venue: Venue
}

export interface AfishaEvent {
  id: string
  title: string
  slug: string
  description?: string
  venue: string
  organizer?: string
  startDate: string
  endDate: string
  coverImage?: string
  minPrice?: number
  category?: {
    name: string
    slug: string
  }
  status: string
}

export interface Venue {
  id: number
  name: string
  slug: string
  description?: string
  address?: string
  priceFrom?: number
  priceTo?: number
  coverImage?: string
  additionalImages?: string
  status: string
  tariff?: 'FREE' | 'SUPER' | 'MAXIMUM'
  averageRating?: number
  reviewsCount?: number
  subcategory: {
    name: string
    slug: string
  }
}

export interface CreateCollectionData {
  title: string
  slug: string
  description?: string
  coverImage?: string
  city: string
  citySlug?: string
  order?: number
  isActive?: boolean
  hideFromAfisha?: boolean
  showInVenues?: boolean
  showInMain?: boolean
  showInBlog?: boolean
  eventsTitle?: string
  eventsDescription?: string
  venuesTitle?: string
  venuesDescription?: string
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {
  id: string
}

export interface AddVenueToCollectionData {
  venueId: number
  order?: number
}

export interface UpdateVenueOrderData {
  venueId: number
  order: number
}
