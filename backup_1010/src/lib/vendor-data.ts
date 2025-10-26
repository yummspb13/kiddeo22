// src/lib/vendor-data.ts
import prisma from "@/lib/db"
import { requireVendorAccess } from "./vendor-guard"

export async function getVendorData() {
  const vendor = await requireVendorAccess()
  
  if (!vendor) {
    throw new Error("Vendor not found")
  }

  // Получаем данные онбординга
  const onboarding = await prisma.vendorOnboarding.findUnique({
    where: { vendorId: vendor.id }
  }) || {
    step: 1,
    completedSteps: [],
    isCompleted: false
  }

  // Получаем текущую подписку
  const subscription = await prisma.vendorSubscription.findFirst({
    where: { 
      vendorId: vendor.id,
      status: 'PAID'
    },
    include: {
      tariffPlan: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Получаем статистику
  const [
    totalListings,
    activeListings,
    pendingListings,
    totalViews,
    totalBookings,
    totalRevenue
  ] = await Promise.all([
    prisma.listing.count({
      where: { vendorId: vendor.id }
    }),
    prisma.listing.count({
      where: { vendorId: vendor.id, isActive: true }
    }),
    prisma.listing.count({
      where: { 
        vendorId: vendor.id,
        moderation: {
          status: 'PENDING'
        }
      }
    }),
    // TODO: Реализовать подсчет просмотров
    0,
    prisma.booking.count({
      where: { 
        listing: { vendorId: vendor.id }
      }
    }),
    prisma.payment.aggregate({
      where: { 
        vendorId: vendor.id,
        status: 'PAID'
      },
      _sum: { amount: true }
    }).then(result => result._sum.amount || 0)
  ])

  // Получаем последние объявления
  const recentListings = await prisma.listing.findMany({
    where: { vendorId: vendor.id },
    include: {
      moderation: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  })

  // Получаем аналитику (заглушка)
  const analytics = {
    period: '30d',
    views: totalViews,
    clicks: Math.floor(totalViews * 0.1), // 10% кликабельность
    bookings: totalBookings,
    revenue: totalRevenue,
    conversion: {
      viewsToClicks: 10.0,
      clicksToBookings: 5.0,
      bookingsToRevenue: 100.0
    },
    topListings: recentListings.slice(0, 5).map(listing => ({
      id: listing.id,
      title: listing.title,
      views: Math.floor(Math.random() * 1000),
      bookings: Math.floor(Math.random() * 50),
      revenue: Math.floor(Math.random() * 10000)
    }))
  }

  // Получаем тарифные планы
  const tariffPlans = await prisma.vendorTariffPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  })

  return {
    vendor: {
      id: vendor.id,
      displayName: vendor.displayName,
      logo: vendor.logo || undefined,
      description: vendor.description || undefined,
      phone: vendor.phone || undefined,
      email: vendor.email || undefined,
      address: vendor.address || undefined,
      website: vendor.website || undefined
    },
    onboarding: {
      step: onboarding.step,
      completedSteps: onboarding.completedSteps as number[],
      isCompleted: onboarding.isCompleted
    },
    subscription: {
      id: subscription?.id || 0,
      planName: subscription?.tariffPlan.name || 'Бесплатный',
      tariff: subscription?.tariffPlan.tariff || 'FREE',
      status: 'PAID' as const,
      amount: 0,
      startsAt: subscription?.startsAt || new Date(),
      endsAt: subscription?.endsAt || undefined,
      autoRenew: subscription?.autoRenew || false
    },
    stats: {
      totalListings,
      activeListings,
      pendingListings,
      totalViews,
      totalBookings,
      totalRevenue
    },
    recentListings: recentListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      type: listing.type as "EVENT" | "VENUE" | "SERVICE",
      status: (listing.moderation?.status as "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION") || 'DRAFT',
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      eventDate: listing.eventDate || undefined,
      address: listing.address || undefined,
      priceFrom: listing.priceFrom || undefined,
      priceTo: listing.priceTo || undefined,
      views: Math.floor(Math.random() * 1000),
      bookings: Math.floor(Math.random() * 50)
    })),
    analytics: {
      totalViews: analytics.views,
      totalClicks: analytics.clicks,
      totalBookings: analytics.bookings,
      conversionRate: analytics.conversion.viewsToClicks
    },
    tariffPlans: tariffPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      tariff: plan.tariff,
      price: plan.price,
      features: plan.features as string[],
      maxListings: plan.maxListings || undefined,
      isPopular: plan.tariff === 'BASIC'
    })),
    payments: [],
    slots: [],
    moderationItems: [],
    reports: analytics,
    commissions: [],
    payouts: [],
    balance: 0
  }
}
