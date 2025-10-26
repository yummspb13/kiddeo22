// src/lib/types.ts
export interface City {
  id: number
  name: string
  slug: string
  isPublic: boolean
}

export interface Event {
  id: number
  title: string
  description: string
  price?: number
  ageFrom?: number
  ageTo?: number
  lat?: number
  lng?: number
  isFree?: boolean
  isIndoor?: boolean
  district?: string
  priceFrom?: number
  priceTo?: number
  eventDate?: Date
  eventEndDate?: Date
}

export interface EventLocation {
  id: number
  title: string
  lat: number
  lng: number
}

export interface VendorData {
  vendor: {
    id: number
    displayName: string
    logo?: string
    description?: string
    phone?: string
    email?: string
    address?: string
    website?: string
  }
  subscription: {
    id: number
    planName: string
    tariff: "FREE" | "BASIC" | "PREMIUM"
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAID" | "PENDING" | "FAILED"
    amount: number
    startsAt: Date
    endsAt?: Date
    autoRenew: boolean
  }
  analytics: {
    totalViews: number
    totalClicks: number
    totalBookings: number
    conversionRate: number
  }
  payments: unknown[]
  slots: unknown[]
  moderationItems: unknown[]
  reports: unknown
  commissions: unknown[]
  payouts: unknown[]
  balance: number
  onboarding: {
    step: number
    completedSteps: number[]
    isCompleted: boolean
  }
  stats: {
    totalListings: number
    activeListings: number
    pendingListings: number
    totalViews: number
    totalBookings: number
    totalRevenue: number
  }
  recentListings: unknown[]
  tariffPlans: unknown[]
}

export interface Subscription {
  id: number
  planName: string
  tariff: "FREE" | "BASIC" | "PREMIUM"
  status: "PAID" | "CANCELLED" | "PENDING" | "FAILED" | "ACTIVE" | "EXPIRED"
  amount: number
  startsAt: Date
  endsAt?: Date
  autoRenew: boolean
}
